import PaginationReturnTypes from "../../entities/PaginationReturnTypes";
import BookFilter, {BookFilterType, BookSortType} from "../../validations/BookFilter";
import {getPaginatedItems, WhereArgs} from "../../utils/paginator";
import {FilterParamsType} from "../../validations/FilterParams";


const getSortType = (sort: BookSortType | undefined) => {
    if (!sort) return undefined;

    if (sort === "added_date_asc")
        return ({addedDate: "asc"});

    if (sort === "added_date_desc")
        return ({addedDate: "desc"});

    if (sort === "pub_date_asc")
        return ({publicationYear: "asc"});

    if (sort === "pub_date_desc")
        return ({publicationYear: "desc"});

    if (sort === "ratings_asc")
        return ({rating: {score: "asc"}});

    if (sort === "ratings_desc")
        return ({rating: {score: "desc"}});

    return undefined;
};

const getFilter = (filter: BookFilterType): WhereArgs => {
    const seed = filter.seed;
    const genre = filter.genre;
    const publisher = filter.publisher;
    const author = filter.author;

    const whereArgs: WhereArgs = {fields: [], defaultSeed: ''} as WhereArgs;

    if (seed) {
        whereArgs.fields = [
            ...(whereArgs.fields || []),
            {column: "title", search: true, seed: seed},
            {column: "subTitle", search: true, seed: seed},
        ];
    }

    if (genre)
        whereArgs.fields.push({column: "bookGenres", child: "genreId", seed: genre, oneToMany: true});
    if (publisher)
        whereArgs.fields.push({column: "publisherId", seed: publisher});
    if (author)
        whereArgs.fields.push({column: "bookAuthors", child: "authorId", seed: author, oneToMany: true});

    return whereArgs;
};

const searchBooks = async (query: BookFilterType) => {
    const res = {statusCode: 200, info: {hasNextPage: false, itemsCount: 0}, data: {}} as PaginationReturnTypes;

    const valid = BookFilter.safeParse(query);
    if (valid.error && !valid.error.isEmpty) return res;

    const filter = valid.data! as BookFilterType;

    const seed = filter.seed;
    const sort = filter.sort;

    let sorting: {} | undefined = getSortType(sort);
    const include = ["publisher", "ratings", "bookGenres", "bookAuthors"];
    const pageParams: FilterParamsType = {page: filter.page, pageSize: filter.pageSize};
    const whereArgs = getFilter(filter);

    if (seed && !sorting)
         sorting = {
            _relevance: {
                fields: ["title", 'subTitle'],
                search: seed,
                sort: "desc"
            }
        };
    return await getPaginatedItems("bookInfo", pageParams, whereArgs, include, sorting);
};

const findBooks = async (seed: string, params: FilterParamsType) => {
    const whereArgs = {
        defaultSeed: seed,
        fields: [
            {column: "isbns", child: "isbn", oneToMany: true},
            {column: "books", child: "barcode", oneToMany: true},
            {column: "publisher", child: "publisherName"}
        ],
    };
    const includes = ["isbns", "books", "publisher"];

    return getPaginatedItems("bookInfo", params, {...whereArgs, operator: "OR"}, includes);
}

export {
    searchBooks,
    findBooks
};
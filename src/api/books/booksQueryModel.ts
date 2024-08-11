import PaginationReturnTypes from "../../entities/PaginationReturnTypes";
import BookFilter, {BookFilterType, BookSortType} from "../../validations/BookFilter";
import prismaClient from "../../utils/prismaClient";
import {DEFAULT_PAGE_SIZE} from "../../constants/constants";
import {getPaginatedItems} from "../../utils/paginator";
import {FilterParamsType} from "../../validations/FilterParams";


const getSortType = (sort: BookSortType | undefined) => {
    if (!sort) return null;

    if (sort === "added_date_asc")
        return ({orderBy: {addedDate: "asc"}});

    if (sort === "added_date_desc")
        return ({orderBy: {addedDate: "desc"}});

    if (sort === "pub_date_asc")
        return ({orderBy: {publicationYear: "desc"}});

    if (sort === "pub_date_desc")
        return ({orderBy: {publicationYear: "desc"}});

    if (sort === "ratings_asc")
        return ({orderBy: {rating: {score: "asc"}}});

    if (sort === "ratings_desc")
        return ({orderBy: {rating: {score: "desc"}}});

    return null;
};

const searchBooks = async (query: BookFilterType) => {
    const res = {statusCode: 200, info: {hasNextPage: false, itemsCount: 0}, data: {}} as PaginationReturnTypes;

    const valid = BookFilter.safeParse(query);
    if (!valid.error?.isEmpty) return res;

    const filter = valid.data! as BookFilterType;

    const page = filter.page || 1;
    const pageSize = filter.pageSize || DEFAULT_PAGE_SIZE;
    const seed = filter.seed;
    const genre = filter.genre;
    const publisher = filter.publisher;
    const author = filter.author;
    const sort = filter.sort;

    const sorting = getSortType(sort);

    let searchObj: any = {
        skip: Math.abs((page - 1) * pageSize),
        take: pageSize,
        include: {
          publisher: true,
          ratings: true,
          bookGenres: true,
          bookAuthors: true
        },
        where: {}
    };

    if (seed && !sorting)
        searchObj.orderBy = {
            _relevance: {
                fields: ["title", 'subTitle'],
                search: seed,
                sort: "desc"
            }
        };

    if (seed && sorting) {
        searchObj.where = {
            title: {search: seed},
            subTitle: {search: seed}
        };
        searchObj = {...searchObj, ...sorting}
    }

    if (genre)
        searchObj.where = {...searchObj.where, bookGenres: {genreId: genre}};
    if (publisher)
        searchObj.where = {...searchObj.where, publisherId: publisher};
    if (author)
        searchObj.where = {...searchObj.where, bookAuthors: {authorId: author}};

    res.data = await prismaClient.bookInfo.findMany({
        ...searchObj
    });

    return res;
};

const findBooks = async (seed: string, params: FilterParamsType) => {
    const whereArgs = {
        seed: seed,
        fields: [
            {column: "classNumber"},
            {column: "bookNumber"},
            {column: "title", search: true},
            {column: "subTitle", search: true},
            {column: "editionStatement"},
            {column: "numberOfPages"},
            {column: "publicationYear"},
            {column: "seriesStatement"},
            {column: "addedDate"},
            {column: "isbns", child: "isbn"},
            {column: "books", child: "barcode"},
            {column: "publisher", child: "publisherName"}
        ]
    };
    const includes = ["isbns", "books", "publisher"];

    return getPaginatedItems("bookInfo", params, whereArgs, includes);
}

export {
    searchBooks,
    findBooks
};
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findBooks = exports.searchBooks = void 0;
const BookFilter_1 = __importDefault(require("../../validations/BookFilter"));
const paginator_1 = require("../../utils/paginator");
const getSortType = (sort) => {
    if (!sort)
        return undefined;
    if (sort === "added_date_asc")
        return ({ addedDate: "asc" });
    if (sort === "added_date_desc")
        return ({ addedDate: "desc" });
    if (sort === "pub_date_asc")
        return ({ publicationYear: "asc" });
    if (sort === "pub_date_desc")
        return ({ publicationYear: "desc" });
    if (sort === "ratings_asc")
        return ({ rating: { score: "asc" } });
    if (sort === "ratings_desc")
        return ({ rating: { score: "desc" } });
    return undefined;
};
const getFilter = (filter) => {
    const seed = filter.seed;
    const genre = filter.genre;
    const publisher = filter.publisher;
    const author = filter.author;
    const whereArgs = { fields: [], defaultSeed: '' };
    if (seed) {
        whereArgs.fields = [
            ...(whereArgs.fields || []),
            { column: "title", search: true, seed: seed },
            { column: "subTitle", search: true, seed: seed },
        ];
    }
    if (genre)
        whereArgs.fields.push({ column: "bookGenres", child: "genreId", seed: genre, oneToMany: true });
    if (publisher)
        whereArgs.fields.push({ column: "publisherId", seed: publisher });
    if (author)
        whereArgs.fields.push({ column: "bookAuthors", child: "authorId", seed: author, oneToMany: true });
    return whereArgs;
};
const searchBooks = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const res = { statusCode: 200, info: { hasNextPage: false, itemsCount: 0 }, data: {} };
    const valid = BookFilter_1.default.safeParse(query);
    if (valid.error && !valid.error.isEmpty)
        return res;
    const filter = valid.data;
    const seed = filter.seed;
    const sort = filter.sort;
    let sorting = getSortType(sort);
    const include = ["publisher", "ratings", "bookGenres", "bookAuthors"];
    const pageParams = { page: filter.page, pageSize: filter.pageSize };
    const whereArgs = getFilter(filter);
    if (seed && !sorting)
        sorting = {
            _relevance: {
                fields: ["title", 'subTitle'],
                search: seed,
                sort: "desc"
            }
        };
    return yield (0, paginator_1.getPaginatedItems)("bookInfo", pageParams, whereArgs, include, sorting);
});
exports.searchBooks = searchBooks;
const findBooks = (seed, params) => __awaiter(void 0, void 0, void 0, function* () {
    const whereArgs = {
        defaultSeed: seed,
        fields: [
            { column: "isbns", child: "isbn", oneToMany: true },
            { column: "books", child: "barcode", oneToMany: true },
            { column: "publisher", child: "publisherName" }
        ],
    };
    const includes = ["isbns", "books", "publisher"];
    return (0, paginator_1.getPaginatedItems)("bookInfo", params, Object.assign(Object.assign({}, whereArgs), { operator: "OR" }), includes);
});
exports.findBooks = findBooks;

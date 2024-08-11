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
const prismaClient_1 = __importDefault(require("../../utils/prismaClient"));
const constants_1 = require("../../constants/constants");
const paginator_1 = require("../../utils/paginator");
const getSortType = (sort) => {
    if (!sort)
        return null;
    if (sort === "added_date_asc")
        return ({ orderBy: { addedDate: "asc" } });
    if (sort === "added_date_desc")
        return ({ orderBy: { addedDate: "desc" } });
    if (sort === "pub_date_asc")
        return ({ orderBy: { publicationYear: "desc" } });
    if (sort === "pub_date_desc")
        return ({ orderBy: { publicationYear: "desc" } });
    if (sort === "ratings_asc")
        return ({ orderBy: { rating: { score: "asc" } } });
    if (sort === "ratings_desc")
        return ({ orderBy: { rating: { score: "desc" } } });
    return null;
};
const searchBooks = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const res = { statusCode: 200, info: { hasNextPage: false, itemsCount: 0 }, data: {} };
    const valid = BookFilter_1.default.safeParse(query);
    if (!((_a = valid.error) === null || _a === void 0 ? void 0 : _a.isEmpty))
        return res;
    const filter = valid.data;
    const page = filter.page || 1;
    const pageSize = filter.pageSize || constants_1.DEFAULT_PAGE_SIZE;
    const seed = filter.seed;
    const genre = filter.genre;
    const publisher = filter.publisher;
    const author = filter.author;
    const sort = filter.sort;
    const sorting = getSortType(sort);
    let searchObj = {
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
            title: { search: seed },
            subTitle: { search: seed }
        };
        searchObj = Object.assign(Object.assign({}, searchObj), sorting);
    }
    if (genre)
        searchObj.where = Object.assign(Object.assign({}, searchObj.where), { bookGenres: { genreId: genre } });
    if (publisher)
        searchObj.where = Object.assign(Object.assign({}, searchObj.where), { publisherId: publisher });
    if (author)
        searchObj.where = Object.assign(Object.assign({}, searchObj.where), { bookAuthors: { authorId: author } });
    res.data = yield prismaClient_1.default.bookInfo.findMany(Object.assign({}, searchObj));
    return res;
});
exports.searchBooks = searchBooks;
const findBooks = (seed, params) => __awaiter(void 0, void 0, void 0, function* () {
    const whereArgs = {
        seed: seed,
        fields: [
            { column: "classNumber" },
            { column: "bookNumber" },
            { column: "title", search: true },
            { column: "subTitle", search: true },
            { column: "editionStatement" },
            { column: "numberOfPages" },
            { column: "publicationYear" },
            { column: "seriesStatement" },
            { column: "addedDate" },
            { column: "isbns", child: "isbn" },
            { column: "books", child: "barcode" },
            { column: "publisher", child: "publisherName" }
        ]
    };
    const includes = ["isbns", "books", "publisher"];
    return (0, paginator_1.getPaginatedItems)("bookInfo", params, whereArgs, includes);
});
exports.findBooks = findBooks;

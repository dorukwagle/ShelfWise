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
const vitest_1 = require("vitest");
const testUtils_1 = require("../testUtils");
const FetchRequest_1 = __importDefault(require("../FetchRequest"));
const constants_1 = require("../../src/constants/constants");
const prismaClient_1 = __importDefault(require("../../src/utils/prismaClient"));
(0, vitest_1.describe)("Books Query", () => __awaiter(void 0, void 0, void 0, function* () {
    (0, vitest_1.beforeAll)(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, testUtils_1.initialSetup)();
        yield (0, testUtils_1.createBooksMockData)();
    }));
    (0, vitest_1.afterAll)(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, testUtils_1.clearBooksData)();
        yield (0, testUtils_1.clearUpSetup)();
    }));
    (0, vitest_1.describe)("GET /api/books", () => __awaiter(void 0, void 0, void 0, function* () {
        const req = new FetchRequest_1.default(`http://localhost:${testUtils_1.port}/api/books`)
            .setDefaultHeaders();
        (0, vitest_1.beforeAll)(() => __awaiter(void 0, void 0, void 0, function* () {
            req.setCookie("sessionId", testUtils_1.Entities.session.session);
        }));
        (0, vitest_1.it)("should return default page size elements if no filter is given", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, testUtils_1.executeSafely)(() => req.get());
            const realDataLen = yield prismaClient_1.default.bookInfo.count();
            const { data, info } = yield res.json();
            vitest_1.expect.soft(res.status).toBe(200);
            vitest_1.expect.soft(data.length).toBe(constants_1.DEFAULT_PAGE_SIZE);
            vitest_1.expect.soft(info).toHaveProperty("hasNextPage");
            vitest_1.expect.soft(info.itemsCount).toBe(realDataLen);
        }));
        (0, vitest_1.it)("should return books with matching title or subtitle with given seed", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, testUtils_1.executeSafely)(() => req.get("?", { seed: "dystopian" }));
            const { data } = yield res.json();
            vitest_1.expect.soft(res.status).toBe(200);
            data.forEach((book) => {
                vitest_1.expect.soft((book.title + book.subTitle).toLowerCase()).toContain("dystopian");
            });
        }));
        (0, vitest_1.it)("should return books with given genre", () => __awaiter(void 0, void 0, void 0, function* () {
            const genres = yield prismaClient_1.default.genres.findMany();
            const genreId = genres[1].genreId;
            const res = yield (0, testUtils_1.executeSafely)(() => req.get("?", { genre: genreId }));
            const { data } = yield res.json();
            vitest_1.expect.soft(data.length).toBeTruthy();
            data.forEach((book) => {
                vitest_1.expect.soft(book.bookGenres[0].genreId).toBe(genreId);
            });
        }));
        (0, vitest_1.it)("should return books with given publisher", () => __awaiter(void 0, void 0, void 0, function* () {
            const publishers = yield prismaClient_1.default.publishers.findMany();
            const publisher = publishers[1].publisherId;
            const res = yield (0, testUtils_1.executeSafely)(() => req.get("?", { publisher: publisher }));
            const { data } = yield res.json();
            vitest_1.expect.soft(res.status).toBe(200);
            vitest_1.expect.soft(data.length).toBeTruthy();
            data.forEach((book) => {
                vitest_1.expect.soft(book.publisher.publisherId).toBe(publisher);
            });
        }));
        (0, vitest_1.it)("should return books with given authors", () => __awaiter(void 0, void 0, void 0, function* () {
            const authors = yield prismaClient_1.default.authors.findMany();
            const author = authors[1].authorId;
            const res = yield (0, testUtils_1.executeSafely)(() => req.get("?", { author: author }));
            const { data } = yield res.json();
            vitest_1.expect.soft(res.status).toBe(200);
            vitest_1.expect.soft(data.length).toBeTruthy();
            data.forEach((book) => {
                vitest_1.expect.soft(book.bookAuthors[0].authorId).toBe(author);
            });
        }));
        (0, vitest_1.it)("should return books with matching conditions, genre, publisher, authors & seed and sorted", () => __awaiter(void 0, void 0, void 0, function* () {
            const authors = yield prismaClient_1.default.authors.findMany();
            const publishers = yield prismaClient_1.default.publishers.findMany();
            const genres = yield prismaClient_1.default.genres.findMany();
            const publisher = publishers[1].publisherId;
            const genre = genres[1].genreId;
            const author = authors[1].authorId;
            const res = yield (0, testUtils_1.executeSafely)(() => req.get("?", {
                author, genre, publisher,
                sort: "pub_date_desc",
                seed: "test"
            }));
            const { data } = yield res.json();
            vitest_1.expect.soft(res.status).toBe(200);
            vitest_1.expect.soft(data.length).toBeTruthy();
            for (let i = 1; i < data.length; i++) {
                const date1 = data[i].publicationYear;
                const date2 = data[i - 1].publicationYear;
                vitest_1.expect.soft(date2 > date1).toBeTruthy();
            }
            data.forEach((book) => {
                vitest_1.expect.soft(book.bookAuthors[0].authorId).toBe(author);
                vitest_1.expect.soft(book.bookGenres[0].genreId).toBe(genre);
                vitest_1.expect.soft(book.publisher.publisherId).toBe(publisher);
                vitest_1.expect.soft((book.title + book.subTitle).toLowerCase()).toContain("test");
            });
        }));
    }));
    (0, vitest_1.describe)("GET /api/books/find", () => __awaiter(void 0, void 0, void 0, function* () {
        const req = new FetchRequest_1.default(`http://localhost:${testUtils_1.port}/api/books/find`)
            .setDefaultHeaders();
        (0, vitest_1.beforeAll)(() => __awaiter(void 0, void 0, void 0, function* () {
            req.setCookie("sessionId", testUtils_1.Entities.session.session);
        }));
        (0, vitest_1.it)("should return books with given number of pages", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, testUtils_1.executeSafely)(() => req.get("?", {
                seed: 'Pearson'
            }));
            const { data } = yield res.json();
            vitest_1.expect.soft(res.status).toBe(200);
            vitest_1.expect.soft(data.length).toBeTruthy();
            data.forEach((book) => {
                vitest_1.expect.soft(book.publisher.publisherName).toContain('Pearson');
            });
        }));
        (0, vitest_1.it)("should return books with given isbn", () => __awaiter(void 0, void 0, void 0, function* () {
            const isbn = "978-0061120084"; //from testUtils.ts
            const res = yield (0, testUtils_1.executeSafely)(() => req.get("?", {
                seed: isbn
            }));
            const { data } = yield res.json();
            vitest_1.expect.soft(res.status).toBe(200);
            vitest_1.expect.soft(data.length).toBeTruthy();
            data.forEach((book) => {
                vitest_1.expect.soft(book.isbns[0].isbn).toContain(isbn);
            });
        }));
    }));
}));

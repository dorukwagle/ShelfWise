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
const prismaClient_1 = __importDefault(require("../../src/utils/prismaClient"));
const FetchRequest_1 = __importDefault(require("../FetchRequest"));
const uuid_1 = require("uuid");
const constants_1 = require("../../src/constants/constants");
(0, vitest_1.describe)("Attributes", () => __awaiter(void 0, void 0, void 0, function* () {
    (0, vitest_1.describe)("Genres API", () => __awaiter(void 0, void 0, void 0, function* () {
        const totalGenres = 33;
        const req = new FetchRequest_1.default(`http://localhost:${testUtils_1.port}/api/attributes/genres`)
            .setDefaultHeaders();
        let genreParams;
        (0, vitest_1.beforeEach)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, testUtils_1.initialSetup)();
            yield prismaClient_1.default.genres.deleteMany();
            const data = [];
            for (let i = 1; i <= totalGenres; i++)
                data.push({ genre: `test${i}` });
            yield prismaClient_1.default.genres.createMany({
                data
            });
            genreParams = {};
            req.setCookie("sessionId", testUtils_1.Entities.session.session);
        }));
        (0, vitest_1.afterEach)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield prismaClient_1.default.genres.deleteMany();
            yield (0, testUtils_1.clearUpSetup)();
        }));
        (0, vitest_1.it)("should return empty array if invalid genre id is given", () => __awaiter(void 0, void 0, void 0, function* () {
            genreParams.id = (0, uuid_1.v7)();
            const res = yield (0, testUtils_1.executeSafely)(() => req.get("?", genreParams));
            vitest_1.expect.soft(res).toBeTruthy();
            vitest_1.expect.soft(res.status).toBe(200);
            const { data } = yield res.json();
            vitest_1.expect.soft(data).toMatchObject([]);
        }));
        (0, vitest_1.it)("should return the genre if the genre id is given", () => __awaiter(void 0, void 0, void 0, function* () {
            const genre = yield prismaClient_1.default.genres.create({
                data: {
                    genre: "test genre"
                }
            });
            genreParams.id = genre.genreId;
            const res = yield (0, testUtils_1.executeSafely)(() => req.get("?", genreParams));
            const { data } = yield res.json();
            vitest_1.expect.soft(res.status).toBe(200);
            vitest_1.expect.soft(data).toMatchObject(JSON.parse(JSON.stringify(genre)));
        }));
        (0, vitest_1.it)("should return the default pagination contents if no pagination filters are given", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, testUtils_1.executeSafely)(() => req.get("?"));
            vitest_1.expect.soft(res.status).toBe(200);
            const { data } = yield res.json();
            vitest_1.expect.soft(data[0].genre).toBe("test1");
            vitest_1.expect.soft(data[data.length - 1].genre).toBe("test9"); // 9 items default size
        }));
        (0, vitest_1.it)("should return the given page with default size if page is given", () => __awaiter(void 0, void 0, void 0, function* () {
            genreParams.page = 2;
            const res = yield (0, testUtils_1.executeSafely)(() => req.get("?", genreParams));
            vitest_1.expect.soft(res.status).toBe(200);
            const { data } = yield res.json();
            vitest_1.expect.soft(data.length).toBe(constants_1.DEFAULT_PAGE_SIZE);
            vitest_1.expect.soft(data[0].genre).toBe("test10");
        }));
        (0, vitest_1.it)("should return given page of given size if size and page are given", () => __awaiter(void 0, void 0, void 0, function* () {
            genreParams.page = 3;
            genreParams.pageSize = 7;
            const res = yield (0, testUtils_1.executeSafely)(() => req.get("?", genreParams));
            vitest_1.expect.soft(res.status).toBe(200);
            const { data } = yield res.json();
            vitest_1.expect.soft(data.length).toBe(genreParams.pageSize);
            // 1-7, 8-14, 15-22 // 7 items per page, requested 3rd page
            vitest_1.expect.soft(data[0].genre).toBe("test15");
            vitest_1.expect.soft(data[data.length - 1].genre).toBe("test21");
        }));
        (0, vitest_1.it)("should return hasNextPage and itemsCount as per pagination", () => __awaiter(void 0, void 0, void 0, function* () {
            genreParams.page = 3;
            genreParams.pageSize = 7;
            const res1 = yield (0, testUtils_1.executeSafely)(() => req.get("?", genreParams));
            genreParams.page = 4;
            genreParams.pageSize = 10;
            const res2 = yield (0, testUtils_1.executeSafely)(() => req.get("?", genreParams));
            vitest_1.expect.soft(res1.status).toBe(200);
            vitest_1.expect.soft(res2.status).toBe(200);
            const data1 = yield res1.json();
            const data2 = yield res2.json();
            vitest_1.expect.soft(data1.info.hasNextPage).toBeTruthy();
            vitest_1.expect.soft(data2.info.hasNextPage).toBeFalsy();
            vitest_1.expect.soft(data1.info.itemsCount).toBe(totalGenres);
            vitest_1.expect.soft(data2.info.itemsCount).toBe(totalGenres);
            vitest_1.expect.soft(data2.data[data2.data.length - 1].genre).toBe("test33");
            vitest_1.expect.soft(data2.data.length).toBe(totalGenres - ((genreParams.page - 1) * genreParams.pageSize));
        }));
        (0, vitest_1.it)("should return default page sized with the matching items if seed is given", () => __awaiter(void 0, void 0, void 0, function* () {
            genreParams.seed = "21";
            const res = yield (0, testUtils_1.executeSafely)(() => req.get("?", genreParams));
            vitest_1.expect.soft(res.status).toBe(200);
            const { data } = yield res.json();
            vitest_1.expect.soft(data[0].genre).toContain(genreParams.seed);
        }));
        (0, vitest_1.it)("should add new genre and save in database if post request is sent", () => __awaiter(void 0, void 0, void 0, function* () {
            const genre = "damn good";
            const res = yield (0, testUtils_1.executeSafely)(() => req.post("?", {
                genre
            }));
            vitest_1.expect.soft(res.status).toBe(200);
            const data = yield prismaClient_1.default.genres.findFirst({
                where: {
                    genre
                }
            });
            vitest_1.expect.soft(data).toBeTruthy();
        }));
        (0, vitest_1.it)("should update the genre in the database if update request is sent", () => __awaiter(void 0, void 0, void 0, function* () {
            const updated = {
                genre: "hello genre"
            };
            const genre = yield prismaClient_1.default.genres.create({
                data: {
                    genre: "testing genre"
                }
            });
            const res = yield (0, testUtils_1.executeSafely)(() => req.put(genre.genreId, updated));
            const tally = yield prismaClient_1.default.genres.findUnique({ where: { genreId: genre.genreId } });
            vitest_1.expect.soft(res.status).toBe(200);
            vitest_1.expect.soft(tally.genre).toBe(updated.genre);
        }));
        (0, vitest_1.it)("should delete genre if delete request is sent", () => __awaiter(void 0, void 0, void 0, function* () {
            const genre = yield prismaClient_1.default.genres.findFirst();
            const res = yield (0, testUtils_1.executeSafely)(() => req.delete(genre.genreId));
            vitest_1.expect.soft(res.status).toBe(200);
            const testData = yield testUtils_1.testPrisma.genres.findUnique({
                where: { genreId: genre.genreId }
            });
            vitest_1.expect.soft(testData.deletedAt).toBeTruthy();
        }));
        (0, vitest_1.it)("should not return deleted genre get request is sent", () => __awaiter(void 0, void 0, void 0, function* () {
            const genre = yield prismaClient_1.default.genres.create({
                data: {
                    genre: "hello test",
                    deletedAt: new Date()
                }
            });
            genreParams.id = genre.genreId;
            const res = yield (0, testUtils_1.executeSafely)(() => req.reset().get("?", genreParams));
            vitest_1.expect.soft(res.status).toBe(200);
            const { data } = yield res.json();
            vitest_1.expect.soft(data).toMatchObject([]);
        }));
    }));
    (0, vitest_1.describe)("Publishers API", () => __awaiter(void 0, void 0, void 0, function* () {
        const totalPublishers = 34;
        const req = new FetchRequest_1.default(`http://localhost:${testUtils_1.port}/api/attributes/publishers`)
            .setDefaultHeaders();
        let pubParams;
        (0, vitest_1.beforeEach)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, testUtils_1.initialSetup)();
            yield prismaClient_1.default.publishers.deleteMany();
            const data = [];
            for (let i = 1; i <= totalPublishers; i++)
                data.push({ publisherName: `test${i}`, address: `testAddr${i}` });
            yield prismaClient_1.default.publishers.createMany({
                data
            });
            pubParams = {};
            req.setCookie("sessionId", testUtils_1.Entities.session.session);
        }));
        (0, vitest_1.afterEach)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield prismaClient_1.default.publishers.deleteMany();
            yield (0, testUtils_1.clearUpSetup)();
        }));
        (0, vitest_1.it)("should return publisher with pagination", () => __awaiter(void 0, void 0, void 0, function* () {
            pubParams.page = 2;
            pubParams.pageSize = 7;
            const res = yield (0, testUtils_1.executeSafely)(() => req.get("?", pubParams));
            vitest_1.expect.soft(res.status).toBe(200);
            const { data, info } = yield res.json();
            vitest_1.expect.soft(data.length).toBe(pubParams.pageSize);
            vitest_1.expect.soft(info.hasNextPage).toBeTruthy();
            vitest_1.expect.soft(info.itemsCount).toBe(totalPublishers);
        }));
        (0, vitest_1.it)("should add new publisher when valid request is sent", () => __awaiter(void 0, void 0, void 0, function* () {
            const publisher = {
                publisherName: "hello publisher",
                address: "publisher address"
            };
            const res = yield (0, testUtils_1.executeSafely)(() => req.post("?", Object.assign({}, publisher)));
            vitest_1.expect.soft(res.status).toBe(200);
            const data = yield prismaClient_1.default.publishers.findFirst({
                where: {
                    publisherName: publisher.publisherName
                }
            });
            vitest_1.expect.soft(data).toBeTruthy();
        }));
        (0, vitest_1.it)("should update the given publisher in the database if valid data is sent", () => __awaiter(void 0, void 0, void 0, function* () {
            const updated = {
                publisherName: "hello publisher",
                address: "ktm"
            };
            const publisher = yield prismaClient_1.default.publishers.create({
                data: {
                    publisherName: "testing genre",
                    address: "testing address"
                }
            });
            const res = yield (0, testUtils_1.executeSafely)(() => req.put(publisher.publisherId, updated));
            const tally = yield prismaClient_1.default.publishers.findUnique({ where: { publisherId: publisher.publisherId } });
            vitest_1.expect.soft(res.status).toBe(200);
            vitest_1.expect.soft(tally).toMatchObject(updated);
        }));
        (0, vitest_1.it)("should delete the publisher if valid id is sent", () => __awaiter(void 0, void 0, void 0, function* () {
            const publisher = yield prismaClient_1.default.publishers.findFirst();
            const res = yield (0, testUtils_1.executeSafely)(() => req.delete(publisher.publisherId));
            vitest_1.expect.soft(res.status).toBe(200);
            const testData = yield testUtils_1.testPrisma.publishers.findUnique({
                where: { publisherId: publisher.publisherId }
            });
            vitest_1.expect.soft(testData.deletedAt).toBeTruthy();
        }));
    }));
    (0, vitest_1.describe)("Authors API", () => __awaiter(void 0, void 0, void 0, function* () {
        const totalAuthors = 38;
        const req = new FetchRequest_1.default(`http://localhost:${testUtils_1.port}/api/attributes/authors`)
            .setDefaultHeaders();
        let authorParams;
        (0, vitest_1.beforeEach)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, testUtils_1.initialSetup)();
            yield prismaClient_1.default.authors.deleteMany();
            const data = [];
            for (let i = 1; i <= totalAuthors; i++)
                data.push({ fullName: `test${i}` });
            yield prismaClient_1.default.authors.createMany({
                data
            });
            authorParams = {};
            req.setCookie("sessionId", testUtils_1.Entities.session.session);
        }));
        (0, vitest_1.afterEach)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield prismaClient_1.default.authors.deleteMany();
            yield (0, testUtils_1.clearUpSetup)();
        }));
        (0, vitest_1.it)("should return authors with pagination", () => __awaiter(void 0, void 0, void 0, function* () {
            authorParams.page = 2;
            authorParams.pageSize = 7;
            const res = yield (0, testUtils_1.executeSafely)(() => req.get("?", authorParams));
            vitest_1.expect.soft(res.status).toBe(200);
            const { data, info: { hasNextPage, itemsCount } } = yield res.json();
            vitest_1.expect.soft(data.length).toBe(authorParams.pageSize);
            vitest_1.expect.soft(hasNextPage).toBeTruthy();
            vitest_1.expect.soft(itemsCount).toBe(totalAuthors);
        }));
        (0, vitest_1.it)("should add new authors when valid request is sent", () => __awaiter(void 0, void 0, void 0, function* () {
            const author = {
                title: "Mr",
                fullName: "Author FullName",
            };
            const res = yield (0, testUtils_1.executeSafely)(() => req.post("?", Object.assign({}, author)));
            vitest_1.expect.soft(res.status).toBe(200);
            const data = yield prismaClient_1.default.authors.findFirst({
                where: {
                    fullName: author.fullName
                }
            });
            vitest_1.expect.soft(data).toBeTruthy();
        }));
        (0, vitest_1.it)("should update the author in the database if update request is sent", () => __awaiter(void 0, void 0, void 0, function* () {
            const updated = {
                fullName: "hello genre",
                title: "Mr",
            };
            const author = yield prismaClient_1.default.authors.create({
                data: {
                    fullName: "testing genre",
                    title: "Mr"
                }
            });
            const res = yield (0, testUtils_1.executeSafely)(() => req.put(author.authorId, updated));
            const tally = yield prismaClient_1.default.authors.findUnique({ where: { authorId: author.authorId } });
            vitest_1.expect.soft(res.status).toBe(200);
            vitest_1.expect.soft(tally).toMatchObject(updated);
        }));
        (0, vitest_1.it)("should delete the author if valid id is sent", () => __awaiter(void 0, void 0, void 0, function* () {
            const author = yield prismaClient_1.default.authors.findFirst();
            const res = yield (0, testUtils_1.executeSafely)(() => req.delete(author.authorId));
            vitest_1.expect.soft(res.status).toBe(200);
            const testData = yield testUtils_1.testPrisma.authors.findUnique({
                where: { authorId: author.authorId }
            });
            vitest_1.expect.soft(testData.deletedAt).toBeTruthy();
        }));
    }));
}));

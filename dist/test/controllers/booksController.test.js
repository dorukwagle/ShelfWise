"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const supertest_1 = __importDefault(require("supertest"));
const prismaClient_1 = __importDefault(require("../../src/utils/prismaClient"));
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
(0, vitest_1.describe)("BooksController", () => __awaiter(void 0, void 0, void 0, function* () {
    const filePath = "./test/assets/fileTest.jpg";
    let bookPayload;
    const getAgent = () => {
        const agent = (0, supertest_1.default)(`http://localhost:${testUtils_1.port}`)
            .post(`/api/books`)
            .attach("coverPhoto", filePath)
            .set("Cookie", `sessionId=${testUtils_1.Entities.session.session}`);
        for (const key in bookPayload) {
            const value = bookPayload[key];
            const tp = typeof value;
            agent.field(tp === "object" ? `${key}[]` : key, bookPayload[key]);
        }
        return agent;
    };
    const reallocatePayload = () => {
        bookPayload = {
            classNumber: "958347983",
            bookNumber: "9837459837",
            title: "hello test book",
            subTitle: "subtitle",
            editionStatement: "hello edition",
            numberOfPages: 387,
            publicationYear: 2019,
            seriesStatement: "hello series",
            publisherId: "",
            bookAuthors: [""],
            isbns: ["34345353", "34534512", "898734"],
            bookGenres: [""],
            pricePerPiece: 345,
            totalPieces: 5,
            barcodes: ["53487593844", "8923489243", "3768287382", "34535", "34545345"]
        };
        bookPayload.bookAuthors = [testUtils_1.Entities.authors.authorId];
        bookPayload.publisherId = testUtils_1.Entities.publisher.publisherId;
        bookPayload.bookGenres = [testUtils_1.Entities.genres.genreId];
    };
    (0, vitest_1.describe)("POST /api/books", () => __awaiter(void 0, void 0, void 0, function* () {
        const req = new FetchRequest_1.default(`http://localhost:${testUtils_1.port}/api/books`)
            .setDefaultHeaders();
        (0, vitest_1.beforeAll)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, testUtils_1.initialSetup)();
        }));
        (0, vitest_1.afterAll)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, testUtils_1.clearUpSetup)();
        }));
        (0, vitest_1.beforeEach)(() => __awaiter(void 0, void 0, void 0, function* () {
            reallocatePayload();
            req.reset()
                .setDefaultHeaders()
                .setCookie("sessionId", testUtils_1.Entities.session.session);
        }));
        (0, vitest_1.afterEach)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, testUtils_1.clearBooksData)();
        }));
        (0, vitest_1.it)("should return 400 response if cover image is not sent", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, testUtils_1.executeSafely)(() => req.post("?", bookPayload));
            const data = yield res.json();
            vitest_1.expect.soft(res.status).toBe(400);
            vitest_1.expect.soft(data.error).toContain("please upload");
        }));
        (0, vitest_1.it)("should return 400 if totalPieces and barcodes number are not equal", () => __awaiter(void 0, void 0, void 0, function* () {
            bookPayload.totalPieces = 8;
            const res = yield getAgent().expect(400);
            const data = res.body;
            vitest_1.expect.soft(data.error).toContain("mismatch");
        }));
        // it should add book to the book info database
        (0, vitest_1.it)("should add book to the database if valid request sent", () => __awaiter(void 0, void 0, void 0, function* () {
            yield getAgent().expect(200);
            const book = yield prismaClient_1.default.bookInfo.findFirst({
                include: {
                    publisher: true,
                    purchases: true
                }
            });
            const expected = {
                classNumber: bookPayload.classNumber,
                bookNumber: bookPayload.bookNumber,
                numberOfPages: BigInt(bookPayload.numberOfPages),
                publisher: {
                    publisherName: testUtils_1.Entities.publisher.publisherName
                },
                purchases: [
                    {
                        totalPieces: bookPayload.totalPieces,
                        pricePerPiece: bookPayload.pricePerPiece
                    }
                ]
            };
            vitest_1.expect.soft(book).toMatchObject(expected);
        }));
        (0, vitest_1.it)("should add barcodes and isbns to the book table equal to given numbers", () => __awaiter(void 0, void 0, void 0, function* () {
            yield getAgent().expect(200);
            const barcodes = yield prismaClient_1.default.books.findMany();
            const isbns = yield prismaClient_1.default.isbns.findMany();
            vitest_1.expect.soft(barcodes.length).toBe(bookPayload.barcodes.length);
            vitest_1.expect.soft(isbns.length).toBe(bookPayload.isbns.length);
        }));
        (0, vitest_1.it)("should upload and store the photo in the storage saving the name in the database", () => __awaiter(void 0, void 0, void 0, function* () {
            yield getAgent().expect(200);
            const book = yield prismaClient_1.default.bookInfo.findFirst();
            vitest_1.expect.soft(fs.existsSync(path_1.default.join(testUtils_1.imagesUploadPath, book.coverPhoto))).toBeTruthy();
        }));
    }));
    (0, vitest_1.describe)("PUT /api/books/info/:infoId", () => __awaiter(void 0, void 0, void 0, function* () {
        let bookInfo;
        (0, vitest_1.beforeAll)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, testUtils_1.initialSetup)();
        }));
        (0, vitest_1.afterAll)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, testUtils_1.clearUpSetup)();
        }));
        (0, vitest_1.beforeEach)(() => __awaiter(void 0, void 0, void 0, function* () {
            reallocatePayload();
            const res = yield getAgent().expect(200);
            bookInfo = res.body;
        }));
        (0, vitest_1.afterEach)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, testUtils_1.clearBooksData)();
        }));
        const getUpdateAgent = (id, params = "") => {
            return (0, supertest_1.default)(`http://localhost:${testUtils_1.port}`)
                .put(`/api/books/info/${id}/${params}`)
                .set("Cookie", `sessionId=${testUtils_1.Entities.session.session}`);
        };
        (0, vitest_1.it)("should return 404 error if invalid bookInfoId is given", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield getUpdateAgent("sdlkf32424")
                .send(bookPayload)
                .expect(404);
            vitest_1.expect.soft(res.body.error).toContain("not found");
        }));
        (0, vitest_1.it)("should update the bookInfo with the new data", () => __awaiter(void 0, void 0, void 0, function* () {
            bookPayload.classNumber = "98989898";
            bookPayload.bookNumber = "98989897";
            bookPayload.numberOfPages = 501;
            const res = yield getUpdateAgent(bookInfo.bookInfoId)
                .send(bookPayload)
                .expect(200);
            const data = res.body;
            vitest_1.expect.soft(data).toMatchObject({
                classNumber: "98989898",
                bookNumber: "98989897",
                numberOfPages: 501
            });
        }));
        (0, vitest_1.describe)("PUT /api/books/info/:infoId/coverphoto", () => __awaiter(void 0, void 0, void 0, function* () {
            (0, vitest_1.it)("should return 400 if photo is not sent", () => __awaiter(void 0, void 0, void 0, function* () {
                const res = yield getUpdateAgent(bookInfo.bookInfoId, "coverphoto")
                    .expect(400);
                vitest_1.expect.soft(res.body.error).toContain("upload");
            }));
            (0, vitest_1.it)("should update the coverPhoto once the file is sent", () => __awaiter(void 0, void 0, void 0, function* () {
                yield getUpdateAgent(bookInfo.bookInfoId, "coverphoto")
                    .attach("coverPhoto", filePath)
                    .expect(200);
            }));
            (0, vitest_1.it)("should delete old photo, and replace with new one in the storage", () => __awaiter(void 0, void 0, void 0, function* () {
                const getPhoto = () => __awaiter(void 0, void 0, void 0, function* () {
                    return prismaClient_1.default.bookInfo.findUnique({
                        where: {
                            bookInfoId: bookInfo.bookInfoId
                        }
                    });
                });
                const photo = yield getPhoto();
                let photoPath = path_1.default.join(testUtils_1.imagesUploadPath, photo.coverPhoto);
                vitest_1.expect.soft(fs.existsSync(photoPath)).toBeTruthy();
                yield getUpdateAgent(bookInfo.bookInfoId, "coverphoto")
                    .attach("coverPhoto", filePath)
                    .expect(200);
                vitest_1.expect.soft(fs.existsSync(photoPath)).toBeFalsy();
                const newPhoto = yield getPhoto();
                photoPath = path_1.default.join(testUtils_1.imagesUploadPath, newPhoto.coverPhoto);
                vitest_1.expect.soft(fs.existsSync(photoPath)).toBeTruthy();
            }));
        }));
        (0, vitest_1.describe)("PUT /api/books/info/:infoId/genres", () => __awaiter(void 0, void 0, void 0, function* () {
            (0, vitest_1.it)("should delete old genres and update with new ones if valid request is sent", () => __awaiter(void 0, void 0, void 0, function* () {
                yield getUpdateAgent(bookInfo.bookInfoId, "genres")
                    .send({ "bookGenres": [testUtils_1.Entities.genres.genreId] })
                    .expect(200);
            }));
        }));
        (0, vitest_1.describe)("PUT /api/books/info/:infoId/authors", () => __awaiter(void 0, void 0, void 0, function* () {
            (0, vitest_1.it)("should delete old genres and update with new ones if valid request is sent", () => __awaiter(void 0, void 0, void 0, function* () {
                yield getUpdateAgent(bookInfo.bookInfoId, "authors")
                    .send({ "bookAuthors": [testUtils_1.Entities.authors.authorId] })
                    .expect(200);
            }));
        }));
        (0, vitest_1.describe)("PUT /api/books/info/:infoId/isbns", () => __awaiter(void 0, void 0, void 0, function* () {
            (0, vitest_1.it)("should delete old genres and update with new ones if valid request is sent", () => __awaiter(void 0, void 0, void 0, function* () {
                yield getUpdateAgent(bookInfo.bookInfoId, "isbns")
                    .send({ "isbns": ["43532", "3453543", "345"] })
                    .expect(200);
            }));
        }));
        (0, vitest_1.describe)("PUT /api/books/info/:infoId/purchase", () => __awaiter(void 0, void 0, void 0, function* () {
            (0, vitest_1.it)("should delete old genres and update with new ones if valid request is sent", () => __awaiter(void 0, void 0, void 0, function* () {
                const purchase = yield prismaClient_1.default.bookPurchases.findFirst();
                yield getUpdateAgent(purchase.purchaseId, "purchase")
                    .send({ "pricePerPiece": "250" })
                    .expect(200);
            }));
        }));
    }));
    (0, vitest_1.describe)("POST /api/books/add-existing", () => __awaiter(void 0, void 0, void 0, function* () {
        let bookInfo;
        let updateInfo;
        const getUpdateAgent = (id) => {
            return (0, supertest_1.default)(`http://localhost:${testUtils_1.port}`)
                .post(`/api/books/add-existing/${id}`)
                .set("Cookie", `sessionId=${testUtils_1.Entities.session.session}`)
                .send(updateInfo);
        };
        (0, vitest_1.beforeAll)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, testUtils_1.initialSetup)();
        }));
        (0, vitest_1.afterAll)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, testUtils_1.clearUpSetup)();
        }));
        (0, vitest_1.beforeEach)(() => __awaiter(void 0, void 0, void 0, function* () {
            updateInfo = {
                totalPieces: 3,
                pricePerPiece: 340,
                barcodes: ["234234", "24322", "23432"]
            };
            reallocatePayload();
            const res = yield getAgent().expect(200);
            bookInfo = res.body;
        }));
        (0, vitest_1.afterEach)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, testUtils_1.clearBooksData)();
        }));
        (0, vitest_1.it)("should return 404 error if book not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield getUpdateAgent("34534").expect(404);
            vitest_1.expect.soft(res.body.error).toContain("found");
        }));
        (0, vitest_1.it)("should return 400 response if totalCount not match total barcodes", () => __awaiter(void 0, void 0, void 0, function* () {
            updateInfo.totalPieces = 5;
            const res = yield getUpdateAgent(bookInfo.bookInfoId).expect(400);
            vitest_1.expect.soft(res.body.error).toContain("mismatch");
        }));
        (0, vitest_1.it)("should return 200 response if valid data is sent", () => __awaiter(void 0, void 0, void 0, function* () {
            yield getUpdateAgent(bookInfo.bookInfoId).expect(200);
        }));
        (0, vitest_1.it)("should add new book purchase and additional barcodes in the database", () => __awaiter(void 0, void 0, void 0, function* () {
            const initialBarcodes = yield prismaClient_1.default.books.count({
                where: { bookInfoId: bookInfo.bookInfoId }
            });
            const initialPurchase = yield prismaClient_1.default.bookPurchases.count({
                where: { bookInfoId: bookInfo.bookInfoId }
            });
            yield getUpdateAgent(bookInfo.bookInfoId).expect(200);
            const newBarcodes = yield prismaClient_1.default.books.count({
                where: { bookInfoId: bookInfo.bookInfoId }
            });
            const newPurchases = yield prismaClient_1.default.bookPurchases.count({
                where: { bookInfoId: bookInfo.bookInfoId }
            });
            vitest_1.expect.soft(initialPurchase).toBe(1);
            vitest_1.expect.soft(newPurchases).toBe(2);
            vitest_1.expect.soft(initialBarcodes + updateInfo.barcodes.length).toBe(newBarcodes);
        }));
    }));
}));

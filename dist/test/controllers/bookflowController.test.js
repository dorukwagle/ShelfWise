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
const prismaClient_1 = __importDefault(require("../../src/utils/prismaClient"));
(0, vitest_1.describe)("Books Flow", () => __awaiter(void 0, void 0, void 0, function* () {
    (0, vitest_1.beforeAll)(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, testUtils_1.initialSetup)();
        yield (0, testUtils_1.createBooksMockData)();
    }));
    (0, vitest_1.afterAll)(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, testUtils_1.clearBooksData)();
        yield (0, testUtils_1.clearUpSetup)();
    }));
    (0, vitest_1.describe)("POST /api/books/reservation", () => __awaiter(void 0, void 0, void 0, function* () {
        const req = new FetchRequest_1.default(`http://localhost:${testUtils_1.port}/api/books/reservation`);
        (0, vitest_1.beforeAll)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield prismaClient_1.default.bookReservations.deleteMany();
            req.setCookie("sessionId", testUtils_1.Entities.session.session);
        }));
        (0, vitest_1.afterEach)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield prismaClient_1.default.bookReservations.deleteMany();
        }));
        (0, vitest_1.it)("should reserve a book for today if available", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, testUtils_1.executeSafely)(() => __awaiter(void 0, void 0, void 0, function* () { return req.post(testUtils_1.Entities.bookInfos[0].bookInfoId); }));
            const reservation = yield prismaClient_1.default.bookReservations.findFirst();
            const today = new Date();
            vitest_1.expect.soft(res === null || res === void 0 ? void 0 : res.status).toBe(200);
            vitest_1.expect.soft(reservation === null || reservation === void 0 ? void 0 : reservation.status).toBe("Pending");
            vitest_1.expect.soft(reservation === null || reservation === void 0 ? void 0 : reservation.reservationDate).toBe(today);
            vitest_1.expect.soft(reservation === null || reservation === void 0 ? void 0 : reservation.bookInfoId).toBe(testUtils_1.Entities.bookInfos[0].bookInfoId);
        }));
        (0, vitest_1.it)("should create reservation without reserving a book if all books are reserved", () => __awaiter(void 0, void 0, void 0, function* () { }));
        (0, vitest_1.it)("should reserve the first book to be returned if all books issued but none are reserved", () => __awaiter(void 0, void 0, void 0, function* () {
            // reservation date should be the next day date to be returned
        }));
        (0, vitest_1.it)("should set the book status to reserved when confirmed", () => __awaiter(void 0, void 0, void 0, function* () { }));
        (0, vitest_1.it)("should send the reservation notification when the reservation is confirmed", () => __awaiter(void 0, void 0, void 0, function* () { }));
        (0, vitest_1.it)("should set the book status to available if the reservation is cancelled", () => __awaiter(void 0, void 0, void 0, function* () { }));
        (0, vitest_1.it)("should set the book status to issued if reservation is cancelled on issued book", () => __awaiter(void 0, void 0, void 0, function* () { }));
    }));
}));

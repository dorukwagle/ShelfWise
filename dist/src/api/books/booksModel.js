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
exports.deleteWhole = exports.deleteSingleCopy = exports.addExistingBook = exports.updateBarcode = exports.updatePurchase = exports.updateISBNs = exports.updateAuthors = exports.updateGenres = exports.updateCoverPhoto = exports.updateBookInfo = exports.addBook = void 0;
const BookInfo_1 = __importDefault(require("../../validations/BookInfo"));
const formatValidationErrors_1 = __importDefault(require("../../utils/formatValidationErrors"));
const prismaClient_1 = __importDefault(require("../../utils/prismaClient"));
const fs = __importStar(require("node:fs"));
const path_1 = __importDefault(require("path"));
const constants_1 = require("../../constants/constants");
const zod_1 = require("zod");
const dbValidation_1 = require("../../utils/dbValidation");
const v = new BookInfo_1.default();
const findBookOrFail = (bookInfoId) => __awaiter(void 0, void 0, void 0, function* () {
    const res = { statusCode: 404 };
    const bookInfo = yield prismaClient_1.default.bookInfo.findUnique({
        where: { bookInfoId }
    });
    if (!bookInfo)
        res.error = { error: "Book not found" };
    else
        res.data = bookInfo;
    return res;
});
const addBook = (req, coverPhoto) => __awaiter(void 0, void 0, void 0, function* () {
    const res = { statusCode: 400 };
    const validation = yield v.BookInfo().safeParseAsync(req);
    const errRes = (0, formatValidationErrors_1.default)(validation);
    if (errRes)
        return errRes;
    const data = validation.data;
    if (data.totalPieces !== data.barcodes.length) {
        res.error = { error: "totalPieces count and barcodes count mismatch" };
        return res;
    }
    const bookAuthorsData = data.bookAuthors.map(author => ({ authorId: author }));
    const isbnsData = data.isbns.map(isbn => ({ isbn: isbn }));
    const genresData = data.bookGenres.map(genre => ({ genreId: genre }));
    const barcodesData = data.barcodes.map(bar => ({ barcode: bar }));
    res.data = yield prismaClient_1.default.bookInfo.create({
        data: {
            classNumber: data.classNumber,
            coverPhoto: coverPhoto.filename,
            bookNumber: data.bookNumber,
            numberOfPages: data.numberOfPages,
            seriesStatement: data.seriesStatement,
            publisherId: data.publisherId,
            addedDate: data.addedDate,
            subTitle: data.subTitle,
            editionStatement: data.editionStatement,
            title: data.title,
            publicationYear: data.publicationYear,
            bookAuthors: {
                createMany: {
                    data: bookAuthorsData
                }
            },
            purchases: {
                create: {
                    totalPieces: data.totalPieces,
                    pricePerPiece: data.pricePerPiece
                }
            },
            isbns: {
                createMany: {
                    data: isbnsData
                }
            },
            bookGenres: {
                createMany: {
                    data: genresData
                }
            },
            books: {
                createMany: {
                    data: barcodesData
                }
            }
        },
        include: {
            bookGenres: true,
            isbns: true,
            books: true,
            purchases: true,
            publisher: true
        }
    });
    res.statusCode = 200;
    return res;
});
exports.addBook = addBook;
const updateBookInfo = (bookInfoId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const res = { statusCode: 400 };
    const bookInfo = yield findBookOrFail(bookInfoId);
    if (bookInfo.error)
        return bookInfo;
    const exclude = { column: "bookInfoId", value: bookInfo.data.bookInfoId };
    const validations = yield v.BookInfoOnly(exclude).safeParseAsync(data);
    const errRes = (0, formatValidationErrors_1.default)(validations);
    if (errRes)
        return errRes;
    res.data = yield prismaClient_1.default.bookInfo.update({
        where: { bookInfoId: bookInfo.data.bookInfoId },
        data: validations.data
    });
    res.statusCode = 200;
    return res;
});
exports.updateBookInfo = updateBookInfo;
const updateCoverPhoto = (bookInfoId, file) => __awaiter(void 0, void 0, void 0, function* () {
    const res = { statusCode: 400 };
    const bookInfo = yield findBookOrFail(bookInfoId);
    if (bookInfo.error)
        return bookInfo;
    res.data = yield prismaClient_1.default.bookInfo.update({
        where: { bookInfoId },
        data: {
            coverPhoto: file.filename
        }
    });
    fs.unlinkSync(path_1.default.join(constants_1.IMAGE_UPLOAD_PATH, bookInfo.data.coverPhoto));
    res.statusCode = 200;
    return res;
});
exports.updateCoverPhoto = updateCoverPhoto;
const updateGenres = (bookInfoId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const res = { statusCode: 400 };
    const bookInfo = yield findBookOrFail(bookInfoId);
    if (bookInfo.error)
        return bookInfo;
    const validation = yield v.BookGenresOnly().safeParseAsync(data);
    const errRes = (0, formatValidationErrors_1.default)(validation);
    if (errRes)
        return errRes;
    yield prismaClient_1.default.bookWithGenres.deleteMany({
        where: { bookInfoId }
    });
    const updates = validation.data.bookGenres.map(genreId => ({ bookInfoId, genreId }));
    res.data = yield prismaClient_1.default.bookWithGenres.createMany({
        data: updates
    });
    res.statusCode = 200;
    return res;
});
exports.updateGenres = updateGenres;
const updateAuthors = (bookInfoId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const res = { statusCode: 400 };
    const bookInfo = yield findBookOrFail(bookInfoId);
    if (bookInfo.error)
        return bookInfo;
    const validation = yield v.BookAuthorsOnly().safeParseAsync(data);
    const errRes = (0, formatValidationErrors_1.default)(validation);
    if (errRes)
        return errRes;
    yield prismaClient_1.default.bookWithAuthors.deleteMany({
        where: { bookInfoId }
    });
    const updates = validation.data.bookAuthors.map(authorId => ({ bookInfoId, authorId }));
    res.data = yield prismaClient_1.default.bookWithAuthors.createMany({
        data: updates
    });
    res.statusCode = 200;
    return res;
});
exports.updateAuthors = updateAuthors;
const updateISBNs = (bookInfoId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const res = { statusCode: 400 };
    const bookInfo = yield findBookOrFail(bookInfoId);
    if (bookInfo.error)
        return bookInfo;
    const validation = yield v.ISBNsOnly({ column: "bookInfoId", value: bookInfoId }).safeParseAsync(data);
    const errRes = (0, formatValidationErrors_1.default)(validation);
    if (errRes)
        return errRes;
    yield prismaClient_1.default.isbns.deleteMany({
        where: { bookInfoId }
    });
    const updates = validation.data.isbns.map(isbn => ({ bookInfoId, isbn }));
    res.data = yield prismaClient_1.default.isbns.createMany({
        data: updates
    });
    res.statusCode = 200;
    return res;
});
exports.updateISBNs = updateISBNs;
const updatePurchase = (purchaseId, pricePerPiece) => __awaiter(void 0, void 0, void 0, function* () {
    const res = { statusCode: 400 };
    const purchase = yield prismaClient_1.default.bookPurchases.findUnique({ where: { purchaseId } });
    if (!purchase) {
        res.statusCode = 404;
        res.error = { error: "purchaseId not found" };
        return res;
    }
    const validation = (zod_1.z.coerce.number({ required_error: "pricePerPiece is required" })
        .min(0)).safeParse(pricePerPiece);
    const errRes = (0, formatValidationErrors_1.default)(validation);
    if (errRes)
        return errRes;
    res.data = yield prismaClient_1.default.bookPurchases.update({
        where: { purchaseId },
        data: {
            pricePerPiece: validation.data
        }
    });
    res.statusCode = 200;
    return res;
});
exports.updatePurchase = updatePurchase;
const updateBarcode = (bookId, barcode) => __awaiter(void 0, void 0, void 0, function* () {
    const res = { statusCode: 404 };
    const valid = yield (0, dbValidation_1.unique)("books", "barcode", barcode, { column: "bookId", value: bookId });
    const book = yield prismaClient_1.default.books.findUnique({ where: { bookId } });
    if (!(book && valid)) {
        res.error = { error: valid ? "Book Not Found" : "Invalid barcode" };
        return res;
    }
    res.data = yield prismaClient_1.default.books.update({
        where: { bookId },
        data: {
            barcode
        }
    });
    res.statusCode = 200;
    return res;
});
exports.updateBarcode = updateBarcode;
const deleteSingleCopy = (bookId) => __awaiter(void 0, void 0, void 0, function* () {
    yield prismaClient_1.default.books.update({
        where: { bookId },
        data: { deletedAt: new Date().toISOString() }
    });
    return true;
});
exports.deleteSingleCopy = deleteSingleCopy;
const deleteWhole = (bookInfoId) => __awaiter(void 0, void 0, void 0, function* () {
    yield prismaClient_1.default.bookInfo.update({
        where: { bookInfoId },
        data: { deletedAt: new Date().toISOString() }
    });
});
exports.deleteWhole = deleteWhole;
const addExistingBook = (bookInfoId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const res = { statusCode: 400 };
    const bookInfo = yield findBookOrFail(bookInfoId);
    if (bookInfo.error)
        return bookInfo;
    const validation = yield v.BookPurchaseOnly().safeParseAsync(data);
    const errRes = (0, formatValidationErrors_1.default)(validation);
    if (errRes)
        return errRes;
    const valid = validation.data;
    if (valid.totalPieces !== valid.barcodes.length) {
        res.error = { error: "totalPieces count and barcodes count mismatch" };
        return res;
    }
    const purchase = yield prismaClient_1.default.bookPurchases.create({
        data: {
            bookInfoId: bookInfoId,
            totalPieces: valid.totalPieces,
            pricePerPiece: valid.pricePerPiece
        }
    });
    const booksData = valid.barcodes.map((barcode) => ({ bookInfoId, barcode }));
    const books = yield prismaClient_1.default.books.createMany({
        data: booksData
    });
    res.data = { books, purchase };
    res.statusCode = 200;
    return res;
});
exports.addExistingBook = addExistingBook;

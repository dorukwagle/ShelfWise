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
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const dbValidation_1 = require("../utils/dbValidation");
const hasDuplicates = (data) => (new Set(data)).size !== data.length;
class BookInfoValidator {
    constructor() {
        this.uniqueClassNumber = (cn, exclude) => __awaiter(this, void 0, void 0, function* () { return (0, dbValidation_1.unique)("bookInfo", "classNumber", cn, exclude); });
        this.uniqueBookNumber = (bookNumber, exclude) => __awaiter(this, void 0, void 0, function* () { return (0, dbValidation_1.unique)("bookInfo", "bookNumber", bookNumber, exclude); });
        this.publisherExists = (publisherId, exclude) => __awaiter(this, void 0, void 0, function* () { return (0, dbValidation_1.exists)("publishers", "publisherId", publisherId, exclude); });
        this.eachBookAuthorsExists = (authorIds, exclude) => __awaiter(this, void 0, void 0, function* () {
            if (hasDuplicates(authorIds))
                return false;
            for (const authorId of authorIds) {
                let exist = yield (0, dbValidation_1.exists)("authors", "authorId", authorId, exclude);
                if (!exist)
                    return false;
            }
            return true;
        });
        this.eachUniqueIsbn = (isbns, exclude) => __awaiter(this, void 0, void 0, function* () {
            if (hasDuplicates(isbns))
                return false;
            for (const isbn of isbns) {
                let exist = yield (0, dbValidation_1.exists)("isbns", "isbn", isbn, exclude);
                if (exist)
                    return false;
            }
            return true;
        });
        this.eachBookGenreExists = (genreIds, exclude) => __awaiter(this, void 0, void 0, function* () {
            if (hasDuplicates(genreIds))
                return false;
            for (const genreId of genreIds) {
                let exist = yield (0, dbValidation_1.exists)("genres", "genreId", genreId, exclude);
                if (!exist)
                    return false;
            }
            return true;
        });
        this.eachUniqueBarcode = (barcodes, exclude) => __awaiter(this, void 0, void 0, function* () {
            if (hasDuplicates(barcodes))
                return false;
            for (const barcode of barcodes) {
                let exist = yield (0, dbValidation_1.exists)("books", "barcode", barcode, exclude);
                if (exist)
                    return false;
            }
            return true;
        });
        this.BookInfoSchema = zod_1.z.object({
            classNumber: zod_1.z.string({ required_error: "class number is required" })
                .refine(val => this.uniqueClassNumber(val, this.exclude), "each class number must be unique"),
            bookNumber: zod_1.z.string({ required_error: "book number is required" })
                .refine(val => this.uniqueBookNumber(val, this.exclude), "each book number must be unique"),
            title: zod_1.z.string({ required_error: "title is required" }),
            subTitle: zod_1.z.string().optional(),
            editionStatement: zod_1.z.string().optional(),
            numberOfPages: zod_1.z.coerce.number({ required_error: "number of pages is required" })
                .min(1, "can't be less than 1"),
            publicationYear: zod_1.z.coerce.number({ required_error: "publicationYear is required" })
                .min(1, "can't be less than 1"),
            seriesStatement: zod_1.z.string().optional(),
            addedDate: zod_1.z.coerce.date().optional(),
            publisherId: zod_1.z.string({ required_error: "publisher is required" })
                .refine(this.publisherExists, "publisher not found"),
            bookAuthors: zod_1.z.coerce.string().array().nonempty("at least one author is required")
                .refine(this.eachBookAuthorsExists, "book authors not found or duplicate entry"),
            isbns: zod_1.z.string().array().nonempty("at least one isbn is required")
                .refine(val => this.eachUniqueIsbn(val, this.exclude), "each isbn must be unique"),
            bookGenres: zod_1.z.coerce.string().array().nonempty("at least one genre is required")
                .refine(this.eachBookGenreExists, "book genre not found is duplicate entry"),
            pricePerPiece: zod_1.z.coerce.number().min(0),
            totalPieces: zod_1.z.coerce.number().min(1),
            barcodes: zod_1.z.string().array().nonempty("at least one barcode is required")
                .refine(val => this.eachUniqueBarcode(val, this.exclude), "each barcode must be unique"),
        });
        this.BookInfoOnlySchema = this.BookInfoSchema.omit({
            bookGenres: true,
            bookAuthors: true,
            isbns: true,
            pricePerPiece: true,
            totalPieces: true,
            barcodes: true
        });
        this.BookGenresOnlySchema = this.BookInfoSchema.pick({
            bookGenres: true,
        });
        this.BookAuthorsOnlySchema = this.BookInfoSchema.pick({
            bookAuthors: true,
        });
        this.ISBNsOnlySchema = this.BookInfoSchema.pick({
            isbns: true
        });
        this.BookPurchaseOnlySchema = this.BookInfoSchema.pick({
            pricePerPiece: true,
            totalPieces: true,
            barcodes: true
        });
        this.BookInfo = (exclude) => {
            this.exclude = exclude;
            return this.BookInfoSchema;
        };
        this.BookInfoOnly = (exclude) => {
            this.exclude = exclude;
            return this.BookInfoOnlySchema;
        };
        this.BookGenresOnly = (exclude) => {
            this.exclude = exclude;
            return this.BookGenresOnlySchema;
        };
        this.BookAuthorsOnly = (exclude) => {
            this.exclude = exclude;
            return this.BookAuthorsOnlySchema;
        };
        this.BookPurchaseOnly = (exclude) => {
            this.exclude = exclude;
            return this.BookPurchaseOnlySchema;
        };
        this.ISBNsOnly = (exclude) => {
            this.exclude = exclude;
            return this.ISBNsOnlySchema;
        };
    }
}
const v = new BookInfoValidator();
const a = v.BookInfo();
const b = v.BookInfoOnly();
const g = v.BookGenresOnly();
const aut = v.BookAuthorsOnly();
const i = v.ISBNsOnly();
const p = v.BookPurchaseOnly();
exports.default = BookInfoValidator;

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
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middlewares/auth");
const fileUpload_1 = require("../../utils/fileUpload");
const booksModel_1 = require("./booksModel");
const booksQueryModel_1 = require("./booksQueryModel");
const booksController = express_1.default.Router();
const uploadHandler = (cb) => {
    return (req, res, next) => {
        cb(req, res, err => {
            if (err)
                return res.status(400).json({ error: err.message });
            return next();
        });
    };
};
booksController.get("/", auth_1.memberAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, statusCode, info } = yield (0, booksQueryModel_1.searchBooks)(req.query);
    res.status(statusCode).json({ data, info });
}));
booksController.get("/find", auth_1.assistantManagerAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.query.seed)
        return res.status(200).json([]);
    const { data, statusCode, info } = yield (0, booksQueryModel_1.findBooks)(req.query.seed, req.query);
    res.status(statusCode).json({ data, info });
}));
booksController.post("/", [auth_1.assistantManagerAuth, uploadHandler(fileUpload_1.imageUpload.single("coverPhoto"))], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file)
        return res.status(400).json({ error: "please upload cover photo" });
    const { data, statusCode, error } = yield (0, booksModel_1.addBook)(req.body, req.file);
    res.status(statusCode).json(error ? error : data);
}));
booksController.put("/info/:infoId", auth_1.assistantManagerAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, statusCode, error } = yield (0, booksModel_1.updateBookInfo)(req.params.infoId, req.body);
    res.status(statusCode).json(error ? error : data);
}));
booksController.put("/info/:infoId/coverphoto", [auth_1.assistantManagerAuth, uploadHandler(fileUpload_1.imageUpload.single("coverPhoto"))], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file)
        return res.status(400).json({ error: "please upload cover photo" });
    const { data, statusCode, error } = yield (0, booksModel_1.updateCoverPhoto)(req.params.infoId, req.file);
    res.status(statusCode).json(error ? error : data);
}));
booksController.put("/info/:infoId/genres", auth_1.assistantManagerAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, statusCode, error } = yield (0, booksModel_1.updateGenres)(req.params.infoId, req.body);
    res.status(statusCode).json(error ? error : data);
}));
booksController.put("/info/:infoId/authors", auth_1.assistantManagerAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, statusCode, error } = yield (0, booksModel_1.updateAuthors)(req.params.infoId, req.body);
    res.status(statusCode).json(error ? error : data);
}));
booksController.put("/info/:infoId/isbns", auth_1.assistantManagerAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, statusCode, error } = yield (0, booksModel_1.updateISBNs)(req.params.infoId, req.body);
    res.status(statusCode).json(error ? error : data);
}));
//infoId is purchaseId
booksController.put("/info/:infoId/purchase", auth_1.assistantManagerAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, statusCode, error } = yield (0, booksModel_1.updatePurchase)(req.params.infoId, req.body.pricePerPiece);
    res.status(statusCode).json(error ? error : data);
}));
//infoId is bookId
booksController.put("/info/:infoId/barcode", auth_1.assistantManagerAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.barcode)
        return res.status(400).json({ error: "barcode is required" });
    const { data, statusCode, error } = yield (0, booksModel_1.updateBarcode)(req.params.infoId, req.body.barcode);
    res.status(statusCode).json(error ? error : data);
}));
booksController.delete("/single/:id", auth_1.assistantManagerAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, booksModel_1.deleteSingleCopy)(req.params.id);
    res.status(200).json({ message: "Given copy of book deleted successfully." });
}));
booksController.delete("/whole/:id", auth_1.assistantManagerAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, booksModel_1.deleteWhole)(req.params.id);
    res.status(200).json({ message: "Given Book deleted successfully." });
}));
booksController.post("/add-existing/:infoId", auth_1.assistantManagerAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, statusCode, error } = yield (0, booksModel_1.addExistingBook)(req.params.infoId, req.body);
    res.status(statusCode).json(error ? error : data);
}));
exports.default = booksController;

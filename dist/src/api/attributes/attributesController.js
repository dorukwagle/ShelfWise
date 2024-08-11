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
const attributesModel_1 = require("./attributesModel");
const Genre_1 = __importDefault(require("../../validations/Genre"));
const Publication_1 = __importDefault(require("../../validations/Publication"));
const Author_1 = __importDefault(require("../../validations/Author"));
const auth_1 = require("../../middlewares/auth");
const formatValidationErrors_1 = __importDefault(require("../../utils/formatValidationErrors"));
const attributes = express_1.default.Router();
attributes.get("/roles/:detailed?", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const detailed = req.params.detailed;
    const roles = yield (0, attributesModel_1.getRoles)(detailed === "detailed");
    res.json(roles);
}));
attributes.get("/membership_types", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json(yield (0, attributesModel_1.getMembershipTypes)());
}));
attributes.get("/genres", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { statusCode, data, error, info } = yield (0, attributesModel_1.getGenres)(req.query);
    res.status(statusCode).json(error ? error : { data, info });
}));
attributes.post("/genres", auth_1.assistantManagerAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validation = Genre_1.default.safeParse(req.body);
    const err = (0, formatValidationErrors_1.default)(validation);
    if (err)
        return res.status(err.statusCode).json(err.error);
    res.json(yield (0, attributesModel_1.addGenre)(validation.data.genre));
}));
attributes.put("/genres/:genreId", auth_1.assistantManagerAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validation = Genre_1.default.safeParse(req.body);
    const err = (0, formatValidationErrors_1.default)(validation);
    if (err)
        return res.status(err.statusCode).json(err.error);
    const response = yield (0, attributesModel_1.updateGenre)(req.params.genreId, validation.data.genre);
    res.status(response.statusCode).json(response.data);
}));
attributes.delete("/genres/:genreId", auth_1.assistantManagerAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, attributesModel_1.deleteGenre)(req.params.genreId);
    res.status(response.statusCode).json(response.data);
}));
// PUBLISHERS ROUTES
attributes.get("/publishers", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { statusCode, data, error, info } = yield (0, attributesModel_1.getPublishers)(req.query);
    res.status(statusCode).json(error ? error : { data, info });
}));
attributes.post("/publishers", auth_1.assistantManagerAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validation = Publication_1.default.safeParse(req.body);
    const err = (0, formatValidationErrors_1.default)(validation);
    if (err)
        return res.status(err.statusCode).json(err.error);
    const { publisherName, address } = validation.data;
    res.json(yield (0, attributesModel_1.addPublisher)(publisherName, address));
}));
attributes.put("/publishers/:publisherId", auth_1.assistantManagerAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validation = Publication_1.default.safeParse(req.body);
    const err = (0, formatValidationErrors_1.default)(validation);
    if (err)
        return res.status(err.statusCode).json(err.error);
    const { publisherName, address } = validation.data;
    const response = yield (0, attributesModel_1.updatePublisher)(req.params.publisherId, publisherName, address);
    res.status(response.statusCode).json(response.data);
}));
attributes.delete("/publishers/:publisherId", auth_1.assistantManagerAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, attributesModel_1.deletePublisher)(req.params.publisherId);
    res.status(response.statusCode).json(response.data);
}));
// AUTHORS ROUTES
attributes.get("/authors", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { statusCode, data, info, error } = yield (0, attributesModel_1.getAuthors)(req.query);
    res.status(statusCode).json(error ? error : { data, info });
}));
attributes.post("/authors", auth_1.assistantManagerAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validation = Author_1.default.safeParse(req.body);
    const err = (0, formatValidationErrors_1.default)(validation);
    if (err)
        return res.status(err.statusCode).json(err.error);
    const { fullName, title } = validation.data;
    res.json(yield (0, attributesModel_1.addAuthor)(title, fullName));
}));
attributes.put("/authors/:authorId", auth_1.assistantManagerAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validation = Author_1.default.safeParse(req.body);
    const err = (0, formatValidationErrors_1.default)(validation);
    if (err)
        return res.status(err.statusCode).json(err.error);
    const { title, fullName } = validation.data;
    const response = yield (0, attributesModel_1.updateAuthor)(req.params.authorId, title, fullName);
    res.status(response.statusCode).json(response.data);
}));
attributes.delete("/authors/:authorId", auth_1.assistantManagerAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, attributesModel_1.deleteAuthor)(req.params.authorId);
    res.status(response.statusCode).json(response.data);
}));
exports.default = attributes;

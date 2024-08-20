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
exports.deleteAuthor = exports.updateAuthor = exports.addAuthor = exports.getAuthors = exports.deletePublisher = exports.updatePublisher = exports.addPublisher = exports.getPublishers = exports.deleteGenre = exports.updateGenre = exports.addGenre = exports.getGenres = exports.getMembershipTypes = exports.getRoles = void 0;
const prismaClient_1 = __importDefault(require("../../utils/prismaClient"));
const FilterParams_1 = __importDefault(require("../../validations/FilterParams"));
const paginator_1 = require("../../utils/paginator");
const getValidParams = (data) => {
    return FilterParams_1.default.safeParse(data).data;
};
const genreExists = (genreId) => __awaiter(void 0, void 0, void 0, function* () {
    const genre = yield prismaClient_1.default.genres.findUnique({ where: { genreId } });
    return Boolean(genre);
});
const publisherExists = (publisherId) => __awaiter(void 0, void 0, void 0, function* () {
    const publisher = yield prismaClient_1.default.publishers.findUnique({ where: { publisherId } });
    return Boolean(publisher);
});
const authorExists = (authorId) => __awaiter(void 0, void 0, void 0, function* () {
    const author = yield prismaClient_1.default.authors.findUnique({ where: { authorId } });
    return Boolean(author);
});
const getRoles = (detailed) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield prismaClient_1.default.userRoles.findMany();
    if (detailed)
        return data;
    const roles = {};
    for (const role of data)
        roles[role.role] = role.precedence;
    return roles;
});
exports.getRoles = getRoles;
const getMembershipTypes = () => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.default.membershipTypes.findMany();
});
exports.getMembershipTypes = getMembershipTypes;
const getGenres = (genreParams) => __awaiter(void 0, void 0, void 0, function* () {
    const data = getValidParams(genreParams);
    if (data === null || data === void 0 ? void 0 : data.id)
        return (0, paginator_1.findRecord)("genres", { defaultSeed: data === null || data === void 0 ? void 0 : data.id, fields: [{ column: "genreId" }] });
    let whereArgs = null;
    if (data === null || data === void 0 ? void 0 : data.seed)
        whereArgs = {
            fields: [{ column: "genre" }],
            defaultSeed: data.seed,
        };
    return (0, paginator_1.getPaginatedItems)("genres", genreParams, whereArgs);
});
exports.getGenres = getGenres;
const addGenre = (genreName) => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.default.genres.create({
        data: {
            genre: genreName,
        }
    });
});
exports.addGenre = addGenre;
const updateGenre = (genreId, genreName) => __awaiter(void 0, void 0, void 0, function* () {
    const res = { statusCode: 200 };
    if (!(yield genreExists(genreId))) {
        res.statusCode = 404;
        res.error = {
            message: "genre not found"
        };
        return res;
    }
    res.data = yield prismaClient_1.default.genres.update({
        where: {
            genreId: genreId,
        },
        data: {
            genre: genreName
        }
    });
    return res;
});
exports.updateGenre = updateGenre;
const deleteGenre = (genreId) => __awaiter(void 0, void 0, void 0, function* () {
    const res = { statusCode: 200 };
    if (!(yield genreExists(genreId))) {
        res.statusCode = 404;
        res.error = {
            message: "genre not found"
        };
        return res;
    }
    yield prismaClient_1.default.genres.update({ where: { genreId }, data: { deletedAt: new Date() } });
    return res;
});
exports.deleteGenre = deleteGenre;
const getPublishers = (publisherParams) => __awaiter(void 0, void 0, void 0, function* () {
    const data = getValidParams(publisherParams);
    if (data === null || data === void 0 ? void 0 : data.id)
        return (0, paginator_1.findRecord)("publishers", { fields: [{ column: "publisherId" }], defaultSeed: data === null || data === void 0 ? void 0 : data.id });
    let whereArgs = null;
    if (data === null || data === void 0 ? void 0 : data.seed)
        whereArgs = { fields: ["publisherName"], seed: data === null || data === void 0 ? void 0 : data.seed };
    return (0, paginator_1.getPaginatedItems)("publishers", publisherParams, whereArgs);
});
exports.getPublishers = getPublishers;
const addPublisher = (publisherName, address) => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.default.publishers.create({
        data: {
            publisherName: publisherName,
            address,
        }
    });
});
exports.addPublisher = addPublisher;
const updatePublisher = (publisherId, publisherName, address) => __awaiter(void 0, void 0, void 0, function* () {
    const res = { statusCode: 200 };
    if (!(yield publisherExists(publisherId))) {
        res.statusCode = 404;
        res.error = {
            message: "publisher not found"
        };
        return res;
    }
    res.data = yield prismaClient_1.default.publishers.update({
        where: {
            publisherId,
        },
        data: {
            publisherName,
            address
        }
    });
    return res;
});
exports.updatePublisher = updatePublisher;
const deletePublisher = (publisherId) => __awaiter(void 0, void 0, void 0, function* () {
    const res = { statusCode: 200 };
    if (!(yield publisherExists(publisherId))) {
        res.statusCode = 404;
        res.error = {
            message: "publisher not found"
        };
        return res;
    }
    yield prismaClient_1.default.publishers.update({ where: { publisherId }, data: { deletedAt: new Date() } });
    return res;
});
exports.deletePublisher = deletePublisher;
const getAuthors = (authorParams) => __awaiter(void 0, void 0, void 0, function* () {
    const data = getValidParams(authorParams);
    if (data === null || data === void 0 ? void 0 : data.id)
        return (0, paginator_1.findRecord)("authors", { fields: [{ column: "authorId" }], defaultSeed: data === null || data === void 0 ? void 0 : data.id });
    let whereArgs = null;
    if (data === null || data === void 0 ? void 0 : data.seed)
        whereArgs = { fields: ["fullName"], seed: data === null || data === void 0 ? void 0 : data.seed };
    return (0, paginator_1.getPaginatedItems)("authors", authorParams, whereArgs);
});
exports.getAuthors = getAuthors;
const addAuthor = (title, authorName) => __awaiter(void 0, void 0, void 0, function* () {
    return prismaClient_1.default.authors.create({
        data: {
            title,
            fullName: authorName,
        }
    });
});
exports.addAuthor = addAuthor;
const updateAuthor = (authorId, title, fullName) => __awaiter(void 0, void 0, void 0, function* () {
    const res = { statusCode: 200 };
    if (!(yield authorExists(authorId))) {
        res.statusCode = 404;
        res.error = {
            message: "author not found"
        };
        return res;
    }
    res.data = yield prismaClient_1.default.authors.update({
        where: {
            authorId,
        },
        data: {
            title,
            fullName
        }
    });
    return res;
});
exports.updateAuthor = updateAuthor;
const deleteAuthor = (authorId) => __awaiter(void 0, void 0, void 0, function* () {
    const res = { statusCode: 200 };
    if (!(yield authorExists(authorId))) {
        res.statusCode = 404;
        res.error = {
            message: "publisher not found"
        };
        return res;
    }
    yield prismaClient_1.default.authors.update({ where: { authorId }, data: { deletedAt: new Date() } });
    return res;
});
exports.deleteAuthor = deleteAuthor;

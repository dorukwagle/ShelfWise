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
exports.clearBooksData = exports.createAuthorizationTestRoutes = exports.executeSafely = exports.clearUpSetup = exports.initialSetup = exports.Entities = exports.imagesUploadPath = exports.testPrisma = exports.port = void 0;
const prismaClient_1 = __importDefault(require("../src/utils/prismaClient"));
const vitest_1 = require("vitest");
const hash_1 = require("../src/utils/hash");
const client_1 = require("@prisma/client");
const enum_1 = require("../src/constants/enum");
const auth_1 = require("../src/middlewares/auth");
const userUtils_1 = __importDefault(require("../src/utils/userUtils"));
const singletorServer_1 = require("./singletorServer");
const app_1 = __importDefault(require("../src/app"));
const uuid_1 = require("uuid");
const fs = __importStar(require("node:fs"));
const path_1 = __importDefault(require("path"));
vitest_1.vi.stubEnv("NODE_ENV", "test");
const Entities = {};
exports.Entities = Entities;
exports.port = process.env.PORT || 8080;
exports.testPrisma = new client_1.PrismaClient({
    datasourceUrl: process.env.TEST_DATABASE_URL,
});
exports.imagesUploadPath = path_1.default.join(process.cwd(), "storage/uploads/images");
const executeSafely = (func) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return func();
    }
    catch (ex) {
        console.log(ex.message);
    }
});
exports.executeSafely = executeSafely;
const clearBooksData = () => __awaiter(void 0, void 0, void 0, function* () {
    yield prismaClient_1.default.books.deleteMany();
    yield prismaClient_1.default.isbns.deleteMany();
    yield prismaClient_1.default.bookPurchases.deleteMany();
    yield prismaClient_1.default.bookWithGenres.deleteMany();
    yield prismaClient_1.default.bookWithAuthors.deleteMany();
    yield prismaClient_1.default.bookInfo.deleteMany();
    const basePath = process.cwd() + "/storage/uploads/images";
    const files = fs.readdirSync(basePath);
    files.forEach((file) => fs.unlinkSync(path_1.default.join(basePath, file)));
});
exports.clearBooksData = clearBooksData;
const clearUpSetup = () => __awaiter(void 0, void 0, void 0, function* () {
    yield prismaClient_1.default.memberships.deleteMany();
    yield prismaClient_1.default.sessions.deleteMany();
    yield prismaClient_1.default.users.deleteMany();
    yield prismaClient_1.default.userRoles.deleteMany();
    yield prismaClient_1.default.authors.deleteMany();
    yield prismaClient_1.default.genres.deleteMany();
    yield prismaClient_1.default.globalAttributes.deleteMany();
    yield prismaClient_1.default.publishers.deleteMany();
    yield prismaClient_1.default.$disconnect();
    (0, singletorServer_1.stopServer)();
});
exports.clearUpSetup = clearUpSetup;
const createAuthorizationTestRoutes = () => {
    app_1.default.get("/auth", auth_1.authorize, (req, res) => __awaiter(void 0, void 0, void 0, function* () { return res.status(200).send(yield (0, userUtils_1.default)(req.session.userId)); }));
    app_1.default.get("/member", auth_1.memberAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () { return res.status(200).send(yield (0, userUtils_1.default)(req.session.userId)); }));
    app_1.default.get("/coordinator", auth_1.coordinatorAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () { return res.status(200).send(yield (0, userUtils_1.default)(req.session.userId)); }));
    app_1.default.get("/assistant", auth_1.assistantManagerAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () { return res.status(200).send(yield (0, userUtils_1.default)(req.session.userId)); }));
    app_1.default.get("/manager", auth_1.managerAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () { return res.status(200).send(yield (0, userUtils_1.default)(req.session.userId)); }));
};
exports.createAuthorizationTestRoutes = createAuthorizationTestRoutes;
const initialSetup = () => __awaiter(void 0, void 0, void 0, function* () {
    (0, singletorServer_1.startServer)(exports.port);
    Entities.userRoles = yield prismaClient_1.default.userRoles.create({
        data: {
            role: "Manager",
            precedence: enum_1.UserRoles.Manager
        }
    });
    Entities.membershipType = yield prismaClient_1.default.membershipTypes.create({
        data: {
            type: "Employee",
            precedence: 1
        }
    });
    Entities.user = yield prismaClient_1.default.users.create({
        data: {
            fullName: "Doruk Wagle",
            email: "testing@gmail.com",
            dob: new Date("2001-03-03"),
            address: "Kathmandu Nepal",
            contactNo: "9829293466",
            gender: "Male",
            roleId: Entities.userRoles.roleId,
            rollNumber: "345435345",
            password: yield (0, hash_1.hashPassword)("manager123"),
            accountStatus: "Active",
            enrollmentYear: "2021",
            membership: {
                create: {
                    startDate: new Date("2021-01-01"),
                    expiryDate: new Date("2022-01-01"),
                    membershipTypeId: Entities.membershipType.membershipTypeId
                }
            }
        }
    });
    Entities.membership = (yield prismaClient_1.default.memberships.findUnique({
        where: { userId: Entities.user.userId }
    }));
    Entities.globalAttributes = yield prismaClient_1.default.globalAttributes.create({
        data: {
            issueValidityDays: 7,
            membershipValidationMonths: 3,
            penaltyPerDay: 10
        }
    });
    Entities.genres = yield prismaClient_1.default.genres.create({
        data: { genre: "Supernatural" }
    });
    Entities.authors = yield prismaClient_1.default.authors.create({
        data: { title: "Ms", fullName: "Christina Rossetti" }
    });
    Entities.publisher = yield prismaClient_1.default.publishers.create({
        data: { publisherName: "Eastern Coast", address: "California" }
    });
    const expires = new Date();
    expires.setDate(expires.getDate() + 1);
    Entities.session = yield prismaClient_1.default.sessions.create({
        data: {
            session: (0, uuid_1.v7)(),
            role: "Manager",
            rolePrecedence: enum_1.UserRoles.Manager,
            expiresAt: expires,
            userId: Entities.user.userId
        }
    });
});
exports.initialSetup = initialSetup;

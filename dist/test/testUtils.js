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
exports.createAuthorizationTestRoutes = exports.executeSafely = exports.clearUpSetup = exports.initialSetup = exports.Entities = exports.port = void 0;
const prismaClient_1 = __importDefault(require("../src/utils/prismaClient"));
const vitest_1 = require("vitest");
const app_1 = __importDefault(require("../src/app"));
const hash_1 = require("../src/utils/hash");
const enum_1 = require("../src/constants/enum");
const auth_1 = require("../src/middlewares/auth");
const userUtils_1 = __importDefault(require("../src/utils/userUtils"));
vitest_1.vi.stubEnv('NODE_ENV', 'test');
let server;
exports.port = process.env.PORT || 3000;
const Entities = {};
exports.Entities = Entities;
const executeSafely = (func) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return func();
    }
    catch (ex) {
        console.log(ex.message);
    }
});
exports.executeSafely = executeSafely;
const clearUpSetup = () => __awaiter(void 0, void 0, void 0, function* () {
    yield prismaClient_1.default.sessions.deleteMany();
    yield prismaClient_1.default.users.deleteMany();
    yield prismaClient_1.default.userRoles.deleteMany();
    yield prismaClient_1.default.$disconnect();
    server.close();
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
    server = app_1.default.listen(exports.port);
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
    Entities.membership = yield prismaClient_1.default.memberships.create({
        data: {
            startDate: new Date("2021-01-01"),
            expiryDate: new Date("2022-01-01"),
            membershipTypeId: Entities.membershipType.membershipTypeId
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
            membershipId: Entities.membership.membershipId
        }
    });
});
exports.initialSetup = initialSetup;

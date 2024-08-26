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
const uuid_1 = require("uuid");
const enum_1 = require("../../src/constants/enum");
const FetchRequest_1 = __importDefault(require("../FetchRequest"));
(0, vitest_1.describe)("authorization test", () => __awaiter(void 0, void 0, void 0, function* () {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const request = (url) => new FetchRequest_1.default(url).setDefaultHeaders();
    let session;
    let sessionId;
    let partialUser = {};
    const updatePrecedence = (precedence) => prismaClient_1.default.sessions.update({
        where: {
            sessionId: session.sessionId
        },
        data: Object.assign(Object.assign({}, session), { rolePrecedence: precedence })
    });
    const updateSessionValidity = (days) => __awaiter(void 0, void 0, void 0, function* () {
        const date = new Date();
        date.setDate(date.getDate() + days);
        yield prismaClient_1.default.sessions.update({
            where: {
                sessionId: session.sessionId
            },
            data: Object.assign(Object.assign({}, session), { expiresAt: date })
        });
    });
    (0, vitest_1.beforeAll)(() => __awaiter(void 0, void 0, void 0, function* () {
        (0, testUtils_1.createAuthorizationTestRoutes)();
        yield (0, testUtils_1.initialSetup)();
        session = yield prismaClient_1.default
            .sessions.create({
            data: {
                userId: testUtils_1.Entities.user.userId,
                session: (0, uuid_1.v7)(),
                role: "Manager",
                rolePrecedence: enum_1.UserRoles.Manager,
                expiresAt: date
            }
        });
        sessionId = session.session;
        partialUser = {
            userId: testUtils_1.Entities.user.userId,
            email: testUtils_1.Entities.user.email,
            fullName: testUtils_1.Entities.user.fullName
        };
    }));
    (0, vitest_1.afterAll)(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, testUtils_1.clearUpSetup)();
    }));
    /*
    * before some tests. session must be updated, to change role and precedence
    * */
    (0, vitest_1.describe)("basic authorization test", () => {
        const req = request("http://localhost:8080/auth");
        (0, vitest_1.it)("should return 401 if not authorized", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield req.get();
            vitest_1.expect.soft(res === null || res === void 0 ? void 0 : res.status).toBe(401);
            (0, vitest_1.expect)((yield res.json()).error).toBeTruthy();
        }));
        (0, vitest_1.it)("should return 401 if invalid session id", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield req.setCookie("sessionId", (0, uuid_1.v7)())
                .get();
            vitest_1.expect.soft(res === null || res === void 0 ? void 0 : res.status).toBe(401);
            vitest_1.expect.soft((yield res.json()).error).toBeTruthy();
        }));
        (0, vitest_1.it)("should return user info if valid session is given", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield req.setCookie("sessionId", sessionId)
                .get();
            vitest_1.expect.soft(res === null || res === void 0 ? void 0 : res.status).toBe(200);
            vitest_1.expect.soft((yield res.json())).toMatchObject(partialUser);
        }));
        (0, vitest_1.it)("should return 401 if expired session is given", () => __awaiter(void 0, void 0, void 0, function* () {
            yield updateSessionValidity(-5); // decrease by 5 days. i.e. expire session
            const res = yield req.setCookie("sessionId", sessionId)
                .get();
            vitest_1.expect.soft(res === null || res === void 0 ? void 0 : res.status).toBe(401);
            vitest_1.expect.soft((yield res.json()).error).toBeTruthy();
        }));
    });
    (0, vitest_1.describe)("member authorization test", () => __awaiter(void 0, void 0, void 0, function* () {
        const req = request("http://localhost:8080/member");
        (0, vitest_1.beforeAll)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield updateSessionValidity(2); // update validity by 2 days
        }));
        (0, vitest_1.beforeEach)(() => __awaiter(void 0, void 0, void 0, function* () {
            req.setCookie('sessionId', session.session);
        }));
        (0, vitest_1.it)("should return 401 if no session id is sent", () => __awaiter(void 0, void 0, void 0, function* () {
            req.setCookie('sessionId', '');
            const res = yield req.get();
            vitest_1.expect.soft(res === null || res === void 0 ? void 0 : res.status).toBe(401);
            vitest_1.expect.soft((yield res.json()).error).toBeTruthy();
        }));
        (0, vitest_1.it)("should return data if accessed by member role", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield req.get();
            vitest_1.expect.soft(res === null || res === void 0 ? void 0 : res.status).toBe(200);
            vitest_1.expect.soft(yield res.json()).toMatchObject(partialUser);
        }));
        (0, vitest_1.it)("should return data if accessed by higher precedence role", () => __awaiter(void 0, void 0, void 0, function* () {
            yield updatePrecedence(enum_1.UserRoles.Coordinator);
            const res = yield req.get();
            vitest_1.expect.soft(res === null || res === void 0 ? void 0 : res.status).toBe(200);
            vitest_1.expect.soft(yield res.json()).toMatchObject(partialUser);
        }));
    }));
    (0, vitest_1.describe)("assistant manager authorization test", () => __awaiter(void 0, void 0, void 0, function* () {
        const req = request("http://localhost:8080/assistant");
        (0, vitest_1.beforeAll)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield updateSessionValidity(2);
        }));
        (0, vitest_1.beforeEach)(() => __awaiter(void 0, void 0, void 0, function* () {
            req.setCookie('sessionId', session.session);
        }));
        (0, vitest_1.it)("should return 401 if invalid session", () => __awaiter(void 0, void 0, void 0, function* () {
            req.setCookie('sessionId', (0, uuid_1.v7)());
            const res = yield req.get();
            vitest_1.expect.soft(res === null || res === void 0 ? void 0 : res.status).toBe(401);
            vitest_1.expect.soft((yield res.json()).error).toBeTruthy();
        }));
        (0, vitest_1.it)("should return 401 if session expired", () => __awaiter(void 0, void 0, void 0, function* () {
            yield updateSessionValidity(-3);
            const res = yield req.get();
            vitest_1.expect.soft(res === null || res === void 0 ? void 0 : res.status).toBe(401);
            vitest_1.expect.soft((yield res.json()).error).toBeTruthy();
        }));
        (0, vitest_1.it)("should return data if accessed by assistant manager", () => __awaiter(void 0, void 0, void 0, function* () {
            yield updatePrecedence(enum_1.UserRoles.AssistantManager);
            const res = yield req.get();
            vitest_1.expect.soft(res === null || res === void 0 ? void 0 : res.status).toBe(200);
            vitest_1.expect.soft(yield res.json()).toMatchObject(partialUser);
        }));
        (0, vitest_1.it)("should return data if accessed by higher authority user", () => __awaiter(void 0, void 0, void 0, function* () {
            yield updatePrecedence(enum_1.UserRoles.Manager);
            const res = yield req.get();
            vitest_1.expect.soft(res === null || res === void 0 ? void 0 : res.status).toBe(200);
            vitest_1.expect.soft(yield res.json()).toMatchObject(partialUser);
        }));
        (0, vitest_1.it)("should return 403 forbidden, if accessed by lower authority user", () => __awaiter(void 0, void 0, void 0, function* () {
            yield updatePrecedence(enum_1.UserRoles.Coordinator);
            const res = yield req.get();
            vitest_1.expect.soft(res === null || res === void 0 ? void 0 : res.status).toBe(403);
            vitest_1.expect.soft((yield res.json()).error).toBeTruthy();
        }));
    }));
    (0, vitest_1.describe)("withMembership authorization test", () => __awaiter(void 0, void 0, void 0, function* () {
        const req = request("http://localhost:8080/membership-test");
        (0, vitest_1.beforeAll)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, testUtils_1.clearUpSetup)();
        }));
        (0, vitest_1.beforeEach)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, testUtils_1.initialSetup)();
            req.setCookie('sessionId', testUtils_1.Entities.session.session);
        }));
        (0, vitest_1.afterEach)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, testUtils_1.clearUpSetup)();
        }));
        (0, vitest_1.it)("should return 401 if membership is not found", () => __awaiter(void 0, void 0, void 0, function* () {
            yield prismaClient_1.default.memberships.deleteMany();
            const res = yield req.get();
            vitest_1.expect.soft(res === null || res === void 0 ? void 0 : res.status).toBe(401);
            vitest_1.expect.soft((yield res.json()).error).toContain('valid');
        }));
        (0, vitest_1.it)("should return 403 if membership is expired", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield req.get();
            vitest_1.expect.soft(res === null || res === void 0 ? void 0 : res.status).toBe(403);
            vitest_1.expect.soft((yield res.json()).error).toContain('expired');
        }));
        (0, vitest_1.it)("should return 200 if the user has valid membership", () => __awaiter(void 0, void 0, void 0, function* () {
            const date = new Date();
            date.setDate(date.getDate() + 1);
            yield prismaClient_1.default.memberships.update({
                where: {
                    membershipId: testUtils_1.Entities.membership.membershipId
                },
                data: {
                    expiryDate: date.toISOString(),
                }
            });
            const res = yield req.get();
            vitest_1.expect.soft(res === null || res === void 0 ? void 0 : res.status).toBe(200);
        }));
    }));
}));

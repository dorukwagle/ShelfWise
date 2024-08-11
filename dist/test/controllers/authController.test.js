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
const prismaClient_1 = __importDefault(require("../../src/utils/prismaClient"));
const FetchRequest_1 = __importDefault(require("../FetchRequest"));
const testUtils_1 = require("../testUtils");
const uuid_1 = require("uuid");
(0, vitest_1.describe)("AuthController testings...", () => __awaiter(void 0, void 0, void 0, function* () {
    const port = parseInt(process.env.PORT || "3000");
    const url = `http://localhost:${port}/api/auth`;
    const validCredential = {
        "email": "testing@gmail.com",
        "password": "manager123",
    };
    (0, vitest_1.describe)("/api/auth/login", () => __awaiter(void 0, void 0, void 0, function* () {
        (0, vitest_1.beforeAll)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, testUtils_1.initialSetup)();
        }));
        (0, vitest_1.afterAll)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, testUtils_1.clearUpSetup)();
        }));
        const req = new FetchRequest_1.default(url + "/login")
            .setDefaultHeaders();
        (0, vitest_1.it)("should return 401 if email and password is not given", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, testUtils_1.executeSafely)(() => req.post());
            (0, vitest_1.expect)(res).toBeTruthy();
            const data = yield res.json();
            vitest_1.expect.soft(res.status).toBe(401);
            vitest_1.expect.soft(data.error).toContain("required");
        }));
        (0, vitest_1.it)("should return 401 if invalid email is given", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, testUtils_1.executeSafely)(() => req.post("", {
                "email": "invalid.email@gmail.com",
                "password": "haha123",
            }));
            (0, vitest_1.expect)(res).toBeTruthy();
            const data = yield res.json();
            vitest_1.expect.soft(res.status).toBe(401);
            vitest_1.expect.soft(data.error).toContain("Incorrect");
        }));
        (0, vitest_1.it)("should return 401 if incorrect password is given", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, testUtils_1.executeSafely)(() => req.post("", {
                "email": "doruk.wagle@gmail.com",
                "password": "haha123",
            }));
            (0, vitest_1.expect)(res).toBeTruthy();
            const data = yield res.json();
            vitest_1.expect.soft(res.status).toBe(401);
            vitest_1.expect.soft(data.error).toContain("Incorrect");
        }));
        (0, vitest_1.it)("should return 200 with user info if correct email & password is given", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, testUtils_1.executeSafely)(() => req.post("", validCredential));
            const data = yield res.json();
            vitest_1.expect.soft(res.status).toBe(200);
            vitest_1.expect.soft(data).toMatchObject({ gender: "Male", accountStatus: "Active", email: testUtils_1.Entities.user.email });
        }));
        (0, vitest_1.it)("should not include password in the user info after logged in", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, testUtils_1.executeSafely)(() => req.post("", validCredential));
            const data = yield res.json();
            vitest_1.expect.soft(res.status).toBe(200);
            vitest_1.expect.soft(data).not.toHaveProperty("password");
        }));
        (0, vitest_1.it)("should return sessionId and return it if correct email & password is given", () => __awaiter(void 0, void 0, void 0, function* () {
            yield prismaClient_1.default.sessions.deleteMany();
            const res = yield (0, testUtils_1.executeSafely)(() => req.post("", validCredential));
            const sessionData = yield prismaClient_1.default.sessions.findFirst({
                where: { userId: testUtils_1.Entities.user.userId },
            });
            (0, vitest_1.expect)(res).toBeTruthy();
            const session = res.headers.getSetCookie()[0];
            vitest_1.expect.soft(res.status).toBe(200);
            vitest_1.expect.soft(session).toContain("sessionId");
            vitest_1.expect.soft(session).toContain(sessionData === null || sessionData === void 0 ? void 0 : sessionData.session);
        }));
        (0, vitest_1.it)("should return 401 if login attempted by accounts status not Active", () => __awaiter(void 0, void 0, void 0, function* () {
            // update account to have inactive status
            yield prismaClient_1.default.users.update({
                where: {
                    userId: testUtils_1.Entities.user.userId
                },
                data: {
                    accountStatus: "Pending"
                }
            });
            const res = yield (0, testUtils_1.executeSafely)(() => req.post("", validCredential));
            (0, vitest_1.expect)(res).toBeTruthy();
            const data = yield res.json();
            vitest_1.expect.soft(res.status).toBe(401);
            vitest_1.expect.soft(data.error).toContain("Incorrect");
        }));
    }));
    (0, vitest_1.describe)("/api/auth/logout", () => __awaiter(void 0, void 0, void 0, function* () {
        const req = new FetchRequest_1.default(url + "/logout")
            .setDefaultHeaders();
        (0, vitest_1.beforeAll)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, testUtils_1.initialSetup)();
        }));
        (0, vitest_1.afterAll)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, testUtils_1.clearUpSetup)();
        }));
        (0, vitest_1.it)("should return 401 status if not logged in", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, testUtils_1.executeSafely)(() => req.delete());
            (0, vitest_1.expect)(res).toBeTruthy();
            const data = yield res.json();
            vitest_1.expect.soft(res.status).toBe(401);
            vitest_1.expect.soft(data.error).toContain("login");
        }));
        (0, vitest_1.it)("should return 200 if logged in and session should be deleted", () => __awaiter(void 0, void 0, void 0, function* () {
            const date = new Date();
            date.setDate(date.getDate() + 1);
            const sess = yield prismaClient_1.default.sessions.create({
                data: {
                    userId: testUtils_1.Entities.user.userId,
                    role: "Member",
                    rolePrecedence: 5,
                    session: (0, uuid_1.v7)(),
                    expiresAt: date
                }
            });
            const res = yield req.setCookie("sessionId", sess.session).delete();
            (0, vitest_1.expect)(res).toBeTruthy();
            (0, vitest_1.expect)(res.status).toBe(200);
            const sessionCheck = yield prismaClient_1.default.sessions.findFirst({
                where: { sessionId: sess.sessionId }
            });
            (0, vitest_1.expect)(sessionCheck).toBeFalsy();
        }));
    }));
}));

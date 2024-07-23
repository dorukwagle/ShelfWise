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
const authModel_1 = require("../../src/api/auth/authModel");
const prismaClient_1 = __importDefault(require("../../src/utils/prismaClient"));
(0, vitest_1.describe)("authModel -> createSession", () => {
    (0, vitest_1.beforeAll)(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, testUtils_1.initialSetup)();
    }));
    (0, vitest_1.afterAll)(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, testUtils_1.clearUpSetup)();
    }));
    (0, vitest_1.it)("should save the session to the database and return it", () => __awaiter(void 0, void 0, void 0, function* () {
        const sessionReturned = yield (0, authModel_1.createSession)(testUtils_1.Entities.user);
        const expectedSession = yield prismaClient_1.default.sessions.findFirst({
            where: {
                userId: testUtils_1.Entities.user.userId
            }
        });
        vitest_1.expect.soft(expectedSession).toBeTruthy();
        vitest_1.expect.soft(sessionReturned).toBeTruthy();
        vitest_1.expect.soft(sessionReturned).toBe(expectedSession === null || expectedSession === void 0 ? void 0 : expectedSession.session);
    }));
});

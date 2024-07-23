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
const userUtils_1 = __importDefault(require("../../src/utils/userUtils"));
(0, vitest_1.describe)("userUtils", () => __awaiter(void 0, void 0, void 0, function* () {
    (0, vitest_1.beforeAll)(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, testUtils_1.initialSetup)();
    }));
    (0, vitest_1.afterAll)(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, testUtils_1.clearUpSetup)();
    }));
    (0, vitest_1.it)("should return user info with password if (id, true, true)", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, userUtils_1.default)(testUtils_1.Entities.user.userId, true);
        vitest_1.expect.soft(result).toMatchObject({ password: testUtils_1.Entities.user.password });
    }));
    (0, vitest_1.it)("should not return password in the user info if (id, false, true)", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, userUtils_1.default)(testUtils_1.Entities.user.userId, false);
        vitest_1.expect.soft(result).not.toMatchObject({ password: testUtils_1.Entities.user.password });
    }));
    (0, vitest_1.it)("should return membership and role details without password if (id, false, true)", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, userUtils_1.default)(testUtils_1.Entities.user.userId, false, true);
        vitest_1.expect.soft(result).not.toMatchObject({ password: testUtils_1.Entities.user.password });
        vitest_1.expect.soft(result).toMatchObject({ membership: testUtils_1.Entities.membership, role: testUtils_1.Entities.userRoles });
    }));
    (0, vitest_1.it)("should return user info with password without role and membership if (id, true, false)", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, userUtils_1.default)(testUtils_1.Entities.user.userId, true, false);
        vitest_1.expect.soft(result).toMatchObject({ password: testUtils_1.Entities.user.password });
        vitest_1.expect.soft(result).not.toMatchObject({ membership: testUtils_1.Entities.membership, role: testUtils_1.Entities.userRoles });
    }));
}));

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
const prismaClient_1 = __importDefault(require("./prismaClient"));
const getUserInfo = (userIdOrEmail_1, ...args_1) => __awaiter(void 0, [userIdOrEmail_1, ...args_1], void 0, function* (userIdOrEmail, includePassword = false, includeChildren = true) {
    return prismaClient_1.default.users.findFirst({
        where: {
            OR: [
                { email: userIdOrEmail },
                { userId: userIdOrEmail }
            ]
        },
        include: {
            role: includeChildren,
            membership: includeChildren,
        },
        omit: {
            password: !includePassword
        }
    });
});
exports.default = getUserInfo;

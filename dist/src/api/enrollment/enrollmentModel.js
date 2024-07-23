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
exports.getEnrollments = exports.createEnrollmentRequest = void 0;
const prismaClient_1 = __importDefault(require("../../utils/prismaClient"));
const hash_1 = require("../../utils/hash");
const createEnrollmentRequest = (validatedData) => __awaiter(void 0, void 0, void 0, function* () {
    validatedData.password = yield (0, hash_1.hashPassword)(validatedData.password);
    return prismaClient_1.default.users.create({
        data: Object.assign({}, validatedData),
        omit: {
            password: true
        }
    });
});
exports.createEnrollmentRequest = createEnrollmentRequest;
const getEnrollments = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (emailFilter = '') {
    const emailSelect = {};
    return prismaClient_1.default.users.findMany({
        where: {
            accountStatus: "Pending",
            email: emailFilter ? ({
                contains: emailFilter
            }) : undefined
        },
        orderBy: {
            createdAt: "asc"
        }
    });
});
exports.getEnrollments = getEnrollments;

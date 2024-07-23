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
exports.getMembershipTypes = exports.getRoles = void 0;
const prismaClient_1 = __importDefault(require("../../utils/prismaClient"));
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

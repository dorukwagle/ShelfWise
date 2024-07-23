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
const zod_1 = require("zod");
const EnrollmentRequest_1 = __importDefault(require("./EnrollmentRequest"));
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
let currentUserId = "";
const membershipTypeExists = (membershipTypeId) => __awaiter(void 0, void 0, void 0, function* () {
    const membership = yield prismaClient_1.default.membershipTypes.findUnique({
        where: {
            membershipTypeId
        }
    });
    return !!membership;
});
const uniqueEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prismaClient_1.default.users.findFirst({
        where: {
            email: email,
            NOT: { userId: currentUserId }
        }
    });
    return !user;
});
const EnrollmentSchema = EnrollmentRequest_1.default.omit({ email: true }).extend({
    accountStatus: zod_1.z.enum(["Pending", "Active", "Inactive", "Rejected", "Suspended"], { required_error: "Account Status is required" }),
    startDate: zod_1.z.coerce.date({ required_error: "Membership Start Date is required" }),
    expiryDate: zod_1.z.coerce.date({ required_error: "Membership Expiry Date is required" }),
    membershipTypeId: zod_1.z.string({ required_error: "Membership Type is required" })
        .refine(membershipTypeExists, "Membership Type doesn't exist"),
    email: zod_1.z.string({ required_error: "Email is required" })
        .email()
        .refine(uniqueEmail, "Email already exists"),
});
const Enrollment = (userId) => {
    currentUserId = userId;
    return EnrollmentSchema;
};
exports.default = Enrollment;

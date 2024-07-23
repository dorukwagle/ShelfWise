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
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
const roleExists = (roleId) => __awaiter(void 0, void 0, void 0, function* () {
    const role = yield prismaClient_1.default.userRoles.findUnique({
        where: {
            roleId: roleId
        }
    });
    return !!role;
});
const uniqueEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prismaClient_1.default.users.findUnique({
        where: {
            email: email
        }
    });
    return !user;
});
const EnrollmentRequest = zod_1.z.object({
    fullName: zod_1.z.string({ required_error: "Full Name is required" })
        .refine(val => val.split(" ").length >= 2, "Please enter your full name"),
    dob: zod_1.z.coerce.date(),
    address: zod_1.z.string({ required_error: "Address is required" }),
    contactNo: zod_1.z.string({ required_error: "Contact No. is required" }),
    enrollmentYear: zod_1.z.string({ required_error: "Enrollment Year is required" }),
    gender: zod_1.z.enum(["Male", "Female", "Others"], { required_error: "Gender is required" }),
    roleId: zod_1.z.string({ required_error: "Role is required" })
        .refine(roleExists, "User Role not found"),
    rollNumber: zod_1.z.string({ required_error: "Roll Number is required" }),
    email: zod_1.z.string().email().refine(uniqueEmail, "Email already exists"),
    password: zod_1.z.string({ required_error: "Password is required" })
        .min(8, "Password must be at least 8 characters long"),
});
exports.default = EnrollmentRequest;

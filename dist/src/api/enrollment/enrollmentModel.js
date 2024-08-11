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
exports.enrollUser = exports.approveEnrollment = exports.getEnrollments = exports.createEnrollmentRequest = void 0;
const prismaClient_1 = __importDefault(require("../../utils/prismaClient"));
const EnrollmentRequest_1 = __importDefault(require("../../validations/EnrollmentRequest"));
const hash_1 = require("../../utils/hash");
const Enrollment_1 = __importDefault(require("../../validations/Enrollment"));
const formatValidationErrors_1 = __importDefault(require("../../utils/formatValidationErrors"));
const validateApproveEnrollmentRequest = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const res = {};
    res.statusCode = 404;
    const userExist = yield prismaClient_1.default.users.findUnique({
        where: { userId }
    });
    if (!userExist) {
        res.error = { error: "Enrollment does not exist" };
        return res;
    }
    const validation = yield (0, Enrollment_1.default)(userId).safeParseAsync(data);
    const response = (0, formatValidationErrors_1.default)(validation);
    if (response)
        return response;
    res.data = validation.data;
    return res;
});
const createEnrollmentRequest = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const res = { statusCode: 201 };
    const validation = yield EnrollmentRequest_1.default.safeParseAsync(data);
    const response = (0, formatValidationErrors_1.default)(validation);
    if (response)
        return response;
    const validatedData = validation.data;
    validatedData.password = yield (0, hash_1.hashPassword)(validatedData.password);
    res.data = yield prismaClient_1.default.users.create({
        data: Object.assign({}, validatedData),
        omit: {
            password: true
        }
    });
    return res;
});
exports.createEnrollmentRequest = createEnrollmentRequest;
const getEnrollments = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (emailFilter = "") {
    return prismaClient_1.default.users.findMany({
        where: {
            accountStatus: "Pending",
            email: emailFilter ? ({
                contains: emailFilter
            }) : undefined
        },
        orderBy: {
            createdAt: "asc"
        },
        omit: {
            password: true
        }
    });
});
exports.getEnrollments = getEnrollments;
const approveEnrollment = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const validation = yield validateApproveEnrollmentRequest(userId, data);
    if (validation.error)
        return validation;
    const userInfo = yield EnrollmentRequest_1.default.safeParseAsync(validation.data);
    const { accountStatus, startDate, expiryDate, membershipTypeId } = validation.data;
    const user = yield prismaClient_1.default.users.update({
        where: { userId },
        data: Object.assign(Object.assign({}, userInfo.data), { accountStatus: accountStatus, membership: {
                create: {
                    startDate,
                    expiryDate,
                    membershipTypeId
                }
            } }),
        include: {
            membership: true
        },
        omit: {
            password: true
        }
    });
    return { data: user, statusCode: 200 };
});
exports.approveEnrollment = approveEnrollment;
const enrollUser = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const validation = yield (0, Enrollment_1.default)("").safeParseAsync(data);
    const response = (0, formatValidationErrors_1.default)(validation);
    if (response)
        return response;
    const userInfo = yield EnrollmentRequest_1.default.safeParseAsync(validation.data);
    const { accountStatus, membershipTypeId, startDate, expiryDate, } = validation.data;
    const user = yield prismaClient_1.default.users.create({
        data: Object.assign(Object.assign({}, userInfo.data), { accountStatus, membership: {
                create: {
                    membershipTypeId,
                    startDate,
                    expiryDate
                }
            } }),
        include: {
            membership: true
        }
    });
    return { data: user, statusCode: 201 };
});
exports.enrollUser = enrollUser;

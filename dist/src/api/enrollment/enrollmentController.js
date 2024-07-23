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
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middlewares/auth");
const EnrollmentRequest_1 = __importDefault(require("../../validations/EnrollmentRequest"));
const prismaClient_1 = __importDefault(require("../../utils/prismaClient"));
const enrollmentModel_1 = require("./enrollmentModel");
const Enrollment_1 = __importDefault(require("../../validations/Enrollment"));
const enrollment = express_1.default.Router();
const invalidResponse = (validation, res) => {
    var _a, _b, _c;
    if (Object.keys(((_b = (_a = validation.error) === null || _a === void 0 ? void 0 : _a.formErrors) === null || _b === void 0 ? void 0 : _b.fieldErrors) || {}).length)
        return res.status(400).json((_c = validation.error) === null || _c === void 0 ? void 0 : _c.formErrors.fieldErrors);
    if (validation.error)
        return res.status(400).json(validation.error);
    return null;
};
enrollment.get("/", auth_1.assistantManagerAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filterEmail = req.query.email;
    res.status(200).json(yield (0, enrollmentModel_1.getEnrollments)(filterEmail));
}));
enrollment.post("/request", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validation = yield EnrollmentRequest_1.default.safeParseAsync(req.body);
    const response = invalidResponse(validation, res);
    if (response)
        return response;
    const created = yield (0, enrollmentModel_1.createEnrollmentRequest)(validation.data);
    res.status(201).json(created);
}));
enrollment.post("/approve/:userId", auth_1.assistantManagerAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const userExist = yield prismaClient_1.default.users.findUnique({
        where: { userId }
    });
    if (!userExist)
        return res.status(404).json({ error: "Enrollment does not exist" });
    const validation = yield (0, Enrollment_1.default)(userId).safeParseAsync(req.body);
    const response = invalidResponse(validation, res);
    if (response)
        return response;
    const { startDate, expiryDate, membershipTypeId, accountStatus } = validation.data;
    // const membership = await prismaClient.memberships.create({
    //     data: {
    //         startDate,
    //         expiryDate,
    //         membershipTypeId
    //     }
    // });
    const userInfo = yield EnrollmentRequest_1.default.safeParseAsync(req.body);
    const user = yield prismaClient_1.default.users.update({
        where: { userId },
        data: Object.assign(Object.assign({}, userInfo.data), { roleId: "", accountStatus: accountStatus, membership: {
                create: {
                    startDate,
                    expiryDate,
                    membershipTypeId,
                },
            } }),
        include: {
            membership: true
        }
    });
    res.json(user);
}));
exports.default = enrollment;

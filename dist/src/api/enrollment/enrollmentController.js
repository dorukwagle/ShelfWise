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
const enrollmentModel_1 = require("./enrollmentModel");
const enrollment = express_1.default.Router();
enrollment.get("/", auth_1.assistantManagerAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filterEmail = req.query.email;
    res.status(200).json(yield (0, enrollmentModel_1.getEnrollments)(filterEmail));
}));
enrollment.post("/request", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { statusCode, data, error } = yield (0, enrollmentModel_1.createEnrollmentRequest)(req.body);
    return res.status(statusCode).json(error ? error : data);
}));
enrollment.post("/approve/:userId", auth_1.assistantManagerAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { statusCode, data, error } = yield (0, enrollmentModel_1.approveEnrollment)(req.params.userId, req.body);
    return res.status(statusCode).json(error ? error : data);
}));
enrollment.post("/enroll", auth_1.assistantManagerAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { statusCode, data, error } = yield (0, enrollmentModel_1.enrollUser)(req.body);
    return res.status(statusCode).json(error ? error : data);
}));
exports.default = enrollment;

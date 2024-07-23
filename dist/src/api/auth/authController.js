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
const authModel_1 = require("./authModel");
const auth_1 = require("../../middlewares/auth");
const prismaClient_1 = __importDefault(require("../../utils/prismaClient"));
const auth = express_1.default.Router();
auth.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(401).json({ error: "email and password required" });
    const user = yield (0, authModel_1.authenticate)(email, password);
    if (!user)
        return res.status(401).json({ error: "Incorrect email or password" });
    const isProd = process.env.NODE_ENV === "production";
    const session = yield (0, authModel_1.createSession)(user);
    res.cookie("sessionId", session, {
        httpOnly: true,
        sameSite: isProd,
        secure: isProd,
        maxAge: 60 * 60 * 24 * 6 * 1000, // 6 days
    });
    res.status(200).json(user);
}));
auth.delete("/logout", auth_1.authorize, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    yield prismaClient_1.default.sessions.delete({
        where: {
            sessionId: (_a = req.session) === null || _a === void 0 ? void 0 : _a.sessionId
        }
    });
    res.status(200).end();
}));
exports.default = auth;

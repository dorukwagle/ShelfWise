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
exports.withMembership = exports.managerAuth = exports.assistantManagerAuth = exports.coordinatorAuth = exports.memberAuth = exports.authorize = void 0;
const enum_1 = require("../constants/enum");
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
const msg = {
    401: { error: "please login first" },
    403: { error: "permission denied: you are not allowed here" },
};
const getSession = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const sessionCookie = req.cookies.sessionId;
    if (!sessionCookie)
        return null;
    return prismaClient_1.default.sessions.findFirst({
        where: {
            AND: [
                {
                    session: sessionCookie
                },
                {
                    expiresAt: { gte: new Date() }
                }
            ]
        }
    });
});
const authGeneral = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield getSession(req);
    if (!session)
        return res.status(401).json(msg[401]);
    req.session = session;
});
const authorize = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const auth = yield authGeneral(req, res);
    if (!req.session)
        return auth;
    next();
});
exports.authorize = authorize;
const validateAuthority = (req, res, next, rolePrecedence) => __awaiter(void 0, void 0, void 0, function* () {
    const auth = yield authGeneral(req, res);
    if (!req.session)
        return auth;
    if (req.session.rolePrecedence < rolePrecedence)
        return res.status(403).json(msg[403]);
    next();
});
const memberAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () { return yield validateAuthority(req, res, next, enum_1.UserRoles.Member); });
exports.memberAuth = memberAuth;
const coordinatorAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () { return yield validateAuthority(req, res, next, enum_1.UserRoles.Coordinator); });
exports.coordinatorAuth = coordinatorAuth;
const assistantManagerAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () { return yield validateAuthority(req, res, next, enum_1.UserRoles.AssistantManager); });
exports.assistantManagerAuth = assistantManagerAuth;
const managerAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () { return yield validateAuthority(req, res, next, enum_1.UserRoles.Manager); });
exports.managerAuth = managerAuth;
const withMembership = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const auth = yield authGeneral(req, res);
    if (!req.session)
        return auth;
    const membership = yield prismaClient_1.default.memberships.findFirst({
        where: { userId: req.session.userId }
    });
    if (!membership)
        return res.status(401).json({ error: "You do not have a valid membership!" });
    if (membership.status !== "Active")
        return res.status(423).json({ error: "Your membership has been deactivated" });
    if (!(new Date() <= membership.expiryDate))
        return res.status(403).json({ error: "Your membership has expired!. please renew it." });
    next();
});
exports.withMembership = withMembership;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const meController_1 = __importDefault(require("../api/me/meController"));
const authController_1 = __importDefault(require("../api/auth/authController"));
const attributesController_1 = __importDefault(require("../api/attributes/attributesController"));
const auth_1 = require("../middlewares/auth");
const enrollmentController_1 = __importDefault(require("../api/enrollment/enrollmentController"));
const initializeRoutes = (app) => {
    app.use((0, cookie_parser_1.default)());
    app.use("/api/attributes", attributesController_1.default);
    app.use("/api/me", auth_1.authorize, meController_1.default);
    app.use("/api/auth", authController_1.default);
    app.use("/api/enrollments", enrollmentController_1.default);
};
exports.default = initializeRoutes;

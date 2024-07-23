"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("express-async-errors");
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./startup/routes"));
const errorHandler_1 = __importDefault(require("./middlewares/errorHandler"));
const routesLogger_1 = __importDefault(require("./startup/routesLogger"));
const app = (0, express_1.default)();
if (process.env.NODE_ENV === "development") {
    app.use((0, cors_1.default)({
        credentials: true,
        origin: ["http://localhost:5173", "*"],
    }));
}
// increase the payload size
app.use(express_1.default.json({ limit: "2048mb" }));
// apply production settings and protections
// if (process.env.NODE_ENV === "production") prod(app);
if (process.env.NODE_ENV === "development")
    app.use(routesLogger_1.default);
(0, routes_1.default)(app);
app.get("/", (req, res) => {
    res.json({ "message": "Welcome to my app" });
});
// handle and log async errors
app.use(errorHandler_1.default);
exports.default = app;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = __importDefault(require("../utils/logging"));
const errorHandler = (err, req, res, next) => {
    if (err.name === "SyntaxError")
        return res.status(422).json({ error: "Invalid JSON data" });
    logging_1.default.error(err.message, { stack: err.stack });
    return res.status(500).json({
        error: "This is our fault. Something went wrong.!!!",
    });
};
exports.default = errorHandler;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const { combine, timestamp, json, metadata, errors } = winston_1.format;
const logger = (0, winston_1.createLogger)({
    format: combine(errors({ stack: true }), metadata(), timestamp(), json()),
    transports: [
        new winston_1.transports.File({ filename: "storage/logs/logfile.json" }),
        new winston_1.transports.Console(),
    ],
    handleExceptions: true,
    handleRejections: true
});
exports.default = logger;

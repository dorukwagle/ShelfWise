"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const logging_1 = __importDefault(require("./utils/logging"));
const port = process.env.PORT || 3000;
process.on('uncaughtException', (err) => {
    logging_1.default.error('Uncaught Exception', { message: err.message, stack: err.stack });
    process.exit(1);
});
process.on('unhandledRejection', (reason, p) => {
    logging_1.default.error('Unhandled Rejection', { reason, p });
    process.exit(1);
});
const gracefulShutdown = () => {
    server.close(() => {
        console.log('Process terminated');
    });
    setTimeout(() => {
        console.log('Forcefully terminated');
        process.exit(1);
    }, 2000); // Force exit if not closed within 2 seconds
};
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
const server = app_1.default.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});

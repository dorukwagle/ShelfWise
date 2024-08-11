"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopServer = exports.startServer = void 0;
const app_1 = __importDefault(require("../src/app"));
const serverInstance = (port) => {
    return app_1.default.listen(process.env.PORT || 3000);
};
const startServer = (port) => {
    var _a;
    const server = (_a = globalThis.serverGlobal) !== null && _a !== void 0 ? _a : serverInstance(port);
    globalThis.serverGlobal = server;
    return server;
};
exports.startServer = startServer;
const stopServer = () => {
    if (globalThis.serverGlobal)
        globalThis.serverGlobal.close();
    globalThis.serverGlobal = null;
};
exports.stopServer = stopServer;

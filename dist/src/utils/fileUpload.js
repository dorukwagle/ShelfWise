"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const fs = __importStar(require("node:fs"));
const uuid_1 = require("uuid");
const constants_1 = require("../constants/constants");
if (!fs.existsSync(constants_1.IMAGE_UPLOAD_PATH))
    fs.mkdirSync(constants_1.IMAGE_UPLOAD_PATH, { recursive: true });
const imageStorage = multer_1.default.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, constants_1.IMAGE_UPLOAD_PATH);
    },
    filename: function (_req, file, cb) {
        const fileName = (0, uuid_1.v7)() + "_" + Date.now();
        cb(null, `${fileName}.${file.mimetype.split("/")[1]}`);
    }
});
const imageUpload = (0, multer_1.default)({
    storage: imageStorage,
    fileFilter: function (_req, file, callback) {
        const mimetype = file.mimetype.split("/")[0];
        if (mimetype === "image")
            return callback(null, true);
        return callback(new Error(`Expected images. Got ${file.mimetype}`));
    },
    limits: {
        fileSize: 1024 * 1024 * 20,
    },
});
exports.imageUpload = imageUpload;

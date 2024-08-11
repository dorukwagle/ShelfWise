"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EBOOK_UPLOAD_PATH = exports.IMAGE_UPLOAD_PATH = exports.UPLOAD_PATH = exports.DEFAULT_PAGE_SIZE = void 0;
const path_1 = __importDefault(require("path"));
const DEFAULT_PAGE_SIZE = 9;
exports.DEFAULT_PAGE_SIZE = DEFAULT_PAGE_SIZE;
const UPLOAD_PATH = path_1.default.join(process.cwd(), "storage", "uploads");
exports.UPLOAD_PATH = UPLOAD_PATH;
const IMAGE_UPLOAD_PATH = path_1.default.join(UPLOAD_PATH, "images");
exports.IMAGE_UPLOAD_PATH = IMAGE_UPLOAD_PATH;
const EBOOK_UPLOAD_PATH = path_1.default.join(UPLOAD_PATH, "ebooks");
exports.EBOOK_UPLOAD_PATH = EBOOK_UPLOAD_PATH;

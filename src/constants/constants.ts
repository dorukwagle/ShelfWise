import path from "path";

const DEFAULT_PAGE_SIZE = 9;
const UPLOAD_PATH = path.join(process.cwd(), "storage", "uploads");
const IMAGE_UPLOAD_PATH = path.join(UPLOAD_PATH, "images");
const EBOOK_UPLOAD_PATH = path.join(UPLOAD_PATH, "ebooks");

export {
    DEFAULT_PAGE_SIZE,
    UPLOAD_PATH,
    IMAGE_UPLOAD_PATH,
    EBOOK_UPLOAD_PATH,
}
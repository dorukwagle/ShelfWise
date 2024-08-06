import path from "path";
import multer from "multer";
import * as fs from "node:fs";
import {v7} from "uuid";
import {IMAGE_UPLOAD_PATH} from "../constants/constants";




if (!fs.existsSync(IMAGE_UPLOAD_PATH)) fs.mkdirSync(IMAGE_UPLOAD_PATH, { recursive: true });

const imageStorage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, IMAGE_UPLOAD_PATH);
    },
    filename: function (_req, file, cb) {
        const fileName =
            v7() + "_" + Date.now();
        cb(
            null,
            `${fileName}.${file.mimetype.split("/")[1]}`
        );
    }
});

const imageUpload = multer({
    storage: imageStorage,
    fileFilter: function (_req, file, callback) {
        const mimetype = file.mimetype.split("/")[0];
        if (mimetype === "image") return callback(null, true);
        return callback(new Error(`Expected images. Got ${file.mimetype}`));
    },
    limits: {
        fileSize: 1024 * 1024 * 20,
    },
});

export {
    imageUpload
}



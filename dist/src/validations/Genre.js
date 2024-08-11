"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const Genre = zod_1.z.object({
    genre: zod_1.z.string({ required_error: "Genre is required" })
        .min(3, "Must be at least 3 characters")
        .max(50, "Must be at most 20 characters")
});
exports.default = Genre;

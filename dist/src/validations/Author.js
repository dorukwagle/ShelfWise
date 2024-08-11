"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const Author = zod_1.z.object({
    title: zod_1.z.enum(["Mr", "Ms", "Mrs"]),
    fullName: zod_1.z.string({ required_error: "Full Name is required" })
        .refine(val => val.split(" ").length >= 2, "Please enter author's full name")
});
exports.default = Author;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const Publication = zod_1.z.object({
    publisherName: zod_1.z.string({ required_error: "Publication Name is required" })
        .refine(val => val.split(" ").length >= 2, "Please enter valid publication name"),
    address: zod_1.z.string({ required_error: "Address is required" })
});
exports.default = Publication;

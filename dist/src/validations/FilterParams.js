"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const FilterParams = zod_1.z.object({
    id: zod_1.z.string().optional(),
    seed: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number()
        .min(1)
        .optional(),
    pageSize: zod_1.z.coerce.number()
        .min(3)
        .optional()
});
exports.default = FilterParams;

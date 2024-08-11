"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const FilterParams_1 = __importDefault(require("./FilterParams"));
const BookSort = zod_1.z.enum([
    "ratings_asc",
    "ratings_desc",
    "pub_date_asc",
    "pub_date_desc",
    "added_date_asc",
    "added_date_desc",
]);
const BookFilter = FilterParams_1.default.pick({
    page: true,
    pageSize: true
}).extend({
    seed: zod_1.z.string().optional(),
    genre: zod_1.z.string().optional(),
    author: zod_1.z.string().optional(),
    publisher: zod_1.z.string().optional(),
    sort: BookSort.optional(),
});
exports.default = BookFilter;

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findRecord = exports.getPaginatedItems = void 0;
const FilterParams_1 = __importDefault(require("../validations/FilterParams"));
const constants_1 = require("../constants/constants");
const prismaClient_1 = __importDefault(require("./prismaClient"));
const fetchById = (_a) => __awaiter(void 0, [_a], void 0, function* ({ res, model, whereArgs }) {
    const { fields, seed } = whereArgs;
    // @ts-ignore
    res.data = (yield prismaClient_1.default[model].findUnique({
        where: {
            [fields[0].column]: seed
        }
    })) || [];
    return res;
});
const paginateItems = (page_1, size_1, _a, includes_1) => __awaiter(void 0, [page_1, size_1, _a, includes_1], void 0, function* (page, size, { res, model, whereArgs }, includes) {
    const where = {};
    const include = {};
    if (includes === null || includes === void 0 ? void 0 : includes.length)
        includes.forEach(item => include[item] = true);
    if (whereArgs === null || whereArgs === void 0 ? void 0 : whereArgs.fields) {
        whereArgs.fields.forEach(item => where[item.column] = item.child ?
            { [item.child]: { [item.search ? "search" : "contains"]: whereArgs.seed } } :
            { contains: whereArgs.seed });
    }
    // @ts-ignore
    res.data = yield prismaClient_1.default[model].findMany({
        skip: Math.abs((page - 1) * size),
        take: size,
        where,
        include
    });
    // @ts-ignore
    const itemsCount = yield prismaClient_1.default[model].count({
        where
    });
    res.info = {
        itemsCount,
        hasNextPage: (page * size) < itemsCount
    };
    return res;
});
const getPaginatedItems = (model, filterParams, whereArgs, includes) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const res = { statusCode: 200 };
    const validation = FilterParams_1.default.safeParse(filterParams);
    const page = ((_a = validation.data) === null || _a === void 0 ? void 0 : _a.page) || 1;
    const pageSize = ((_b = validation.data) === null || _b === void 0 ? void 0 : _b.pageSize) || constants_1.DEFAULT_PAGE_SIZE;
    const args = { res, model, whereArgs };
    return yield paginateItems(page, pageSize, args, includes);
});
exports.getPaginatedItems = getPaginatedItems;
const findRecord = (model, whereArgs) => __awaiter(void 0, void 0, void 0, function* () {
    const res = { statusCode: 200 };
    return fetchById({ res, model, whereArgs });
});
exports.findRecord = findRecord;

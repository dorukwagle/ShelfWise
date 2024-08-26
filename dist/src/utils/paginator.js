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
    const { fields, defaultSeed } = whereArgs;
    // @ts-ignore
    res.data = (yield prismaClient_1.default[model].findUnique({
        where: {
            [fields[0].column]: fields[0].seed ? fields[0].seed : defaultSeed
        }
    })) || [];
    return res;
});
const paginateItems = (page_1, size_1, _a, includes_1, sort_1) => __awaiter(void 0, [page_1, size_1, _a, includes_1, sort_1], void 0, function* (page, size, { res, model, whereArgs }, includes, sort) {
    const where = [];
    const include = {};
    let orderBy = {};
    if (includes === null || includes === void 0 ? void 0 : includes.length)
        includes.forEach(item => include[item] = true);
    const operator = (whereArgs === null || whereArgs === void 0 ? void 0 : whereArgs.operator) || "AND";
    if (whereArgs === null || whereArgs === void 0 ? void 0 : whereArgs.fields.length) {
        whereArgs.fields.forEach(item => {
            let seed = item.seed || whereArgs.defaultSeed;
            if (item.number)
                seed = Number(seed);
            const relationFilter = {
                [item.child]: {
                    [item.search ? "search" : "contains"]: seed
                }
            };
            const itemFilter = item.number ? { equals: seed } :
                { [item.search ? "search" : "contains"]: seed };
            const whereObj = {};
            whereObj[item.column] = item.child ?
                (item.oneToMany ? { [operator === "AND" ? "every" : "some"]: relationFilter } : relationFilter) : itemFilter;
            where.push(whereObj);
        });
    }
    if (sort)
        orderBy = sort;
    const whereWithOperator = {
        [operator]: where
    };
    const query = {
        skip: Math.abs((page - 1) * size),
        take: size,
        where: whereWithOperator,
        include,
        orderBy
    };
    // @ts-ignore
    res.data = yield prismaClient_1.default[model].findMany(query);
    // @ts-ignore
    const itemsCount = yield prismaClient_1.default[model].count({
        where: whereWithOperator
    });
    res.info = {
        itemsCount,
        hasNextPage: (page * size) < itemsCount
    };
    return res;
});
const getPaginatedItems = (model, filterParams, whereArgs, includes, sort) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const res = { statusCode: 200 };
    const validation = FilterParams_1.default.safeParse(filterParams);
    const page = ((_a = validation.data) === null || _a === void 0 ? void 0 : _a.page) || 1;
    const pageSize = ((_b = validation.data) === null || _b === void 0 ? void 0 : _b.pageSize) || constants_1.DEFAULT_PAGE_SIZE;
    const args = { res, model, whereArgs };
    return yield paginateItems(page, pageSize, args, includes, sort);
});
exports.getPaginatedItems = getPaginatedItems;
const findRecord = (model, whereArgs) => __awaiter(void 0, void 0, void 0, function* () {
    const res = { statusCode: 200 };
    return fetchById({ res, model, whereArgs });
});
exports.findRecord = findRecord;

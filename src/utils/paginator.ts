import FilterParams, {FilterParamsType} from "../validations/FilterParams";
import PaginationReturnTypes from "../entities/PaginationReturnTypes";
import {DEFAULT_PAGE_SIZE} from "../constants/constants";
import prismaClient from "./prismaClient";

type model = "genres" | "publishers" | "authors" | "bookInfo";

export type WhereArgs = {
    fields: {column: string, child?: string, search?: boolean, seed?: any}[],
    defaultSeed: string | number | BigInt;
}

interface Args {
    res: PaginationReturnTypes;
    model: model;
    whereArgs: WhereArgs | undefined;
}

const fetchById = async ({res, model, whereArgs}: Args) => {
    const {fields, defaultSeed} = whereArgs!;

    // @ts-ignore
    res.data = (await prismaClient[model].findUnique({
        where: {
            [fields![0].column]: defaultSeed
        }
    })) || [];
    return res;
};

const paginateItems = async (page: number, size: number,
                             {res, model, whereArgs}: Args, includes?: string[], sort?: {}) => {
    const where: {[key: string]: any} = {};
    const include:{[key: string]: any} = {};
    let orderBy: any = {};

    if (includes?.length)
        includes.forEach(item => include[item] = true);

    if (whereArgs?.fields) {
        whereArgs.fields.forEach(item => where[item.column] = item.child ?
            {[item.child]: {[item.search ? "search" : "contains"]: [item.seed ? item.seed : whereArgs.defaultSeed]}} :
            {[item.search ? "search" : "contains"]: [item.seed ? item.seed : whereArgs.defaultSeed]}
        );
    }

    if (sort)
        orderBy = sort;

    // @ts-ignore
    res.data = await prismaClient[model].findMany({
        skip: Math.abs((page - 1) * size),
        take: size,
        where,
        include,
        orderBy
    });

    // @ts-ignore
    const itemsCount = await prismaClient[model].count({
        where
    });

    res.info = {
        itemsCount,
        hasNextPage: (page * size) < itemsCount
    };

    return res;
};

const getPaginatedItems = async (model: model, filterParams: FilterParamsType,
                                 whereArgs?: WhereArgs, includes?: string[], sort?: {}) => {
    const res = {statusCode: 200} as PaginationReturnTypes;
    const validation = FilterParams.safeParse(filterParams);

    const page = validation.data?.page || 1;
    const pageSize = validation.data?.pageSize || DEFAULT_PAGE_SIZE;

    const args: Args = {res, model, whereArgs};
    return await paginateItems(page, pageSize, args, includes, sort);
};

const findRecord = async (model: model, whereArgs: WhereArgs) => {
    const res = {statusCode: 200} as PaginationReturnTypes;

    return fetchById({res, model, whereArgs});
};

export {
    getPaginatedItems,
    findRecord
};
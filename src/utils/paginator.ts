import FilterParams, {FilterParamsType} from "../validations/FilterParams";
import PaginationReturnTypes from "../entities/PaginationReturnTypes";
import {DEFAULT_PAGE_SIZE} from "../constants/constants";
import prismaClient from "./prismaClient";

type model = "genres" | "publishers" | "authors" | "bookInfo";

type whereArgs = {
    fields: {column: string, child?: string, search?: boolean}[];
    seed: string | number | BigInt;
}

interface Args {
    res: PaginationReturnTypes;
    model: model;
    whereArgs: whereArgs | undefined;
}

const fetchById = async ({res, model, whereArgs}: Args) => {
    const {fields, seed} = whereArgs!;

    // @ts-ignore
    res.data = (await prismaClient[model].findUnique({
        where: {
            [fields![0].column]: seed
        }
    })) || [];
    return res;
};

const paginateItems = async (page: number, size: number, {res, model, whereArgs}: Args, includes?: string[]) => {
    const where: {[key: string]: any} = {};
    const include:{[key: string]: any} = {};

    if (includes?.length)
        includes.forEach(item => include[item] = true);

    if (whereArgs?.fields) {
        whereArgs.fields.forEach(item => where[item.column] = item.child ?
            {[item.child]: {[item.search ? "search" : "contains"]: whereArgs.seed}} :
            {contains: whereArgs.seed}
        );
    }

    // @ts-ignore
    res.data = await prismaClient[model].findMany({
        skip: Math.abs((page - 1) * size),
        take: size,
        where,
        include
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
                                 whereArgs?: whereArgs, includes?: string[]) => {
    const res = {statusCode: 200} as PaginationReturnTypes;
    const validation = FilterParams.safeParse(filterParams);

    const page = validation.data?.page || 1;
    const pageSize = validation.data?.pageSize || DEFAULT_PAGE_SIZE;

    const args: Args = {res, model, whereArgs};
    return await paginateItems(page, pageSize, args, includes);
};

const findRecord = async (model: model, whereArgs: whereArgs) => {
    const res = {statusCode: 200} as PaginationReturnTypes;

    return fetchById({res, model, whereArgs});
};

export {
    getPaginatedItems,
    findRecord
};
import FilterParams, {FilterParamsType} from "../validations/FilterParams";
import PaginationReturnTypes from "../entities/PaginationReturnTypes";
import {DEFAULT_PAGE_SIZE} from "../constants/constants";
import prismaClient from "./prismaClient";

type model = "genres" | "publishers" | "authors" | "bookInfo" | "bookReservations";

export type WhereArgs = {
    fields: { column: string, child?: string, search?: boolean, seed?: any, oneToMany?: boolean, number?: boolean }[],
    defaultSeed: string | number | BigInt;
    operator?: "AND" | "OR";
}

interface Args {
    res: PaginationReturnTypes;
    model: model;
    whereArgs?: WhereArgs;
}

const fetchById = async ({res, model, whereArgs}: Args) => {
    const {fields, defaultSeed} = whereArgs!;

    // @ts-ignore
    res.data = (await prismaClient[model].findUnique({
        where: {
            [fields![0].column]: fields[0].seed ? fields[0].seed : defaultSeed
        }
    })) || [];
    return res;
};

const paginateItems = async (page: number, size: number,
                             {res, model, whereArgs}: Args, includes?: string[], sort?: {}) => {
    const where: { [key: string]: any }[] = [];
    const include: { [key: string]: any } = {};
    let orderBy: any = {};

    if (includes?.length)
        includes.forEach(item => include[item] = true);
        const operator = whereArgs?.operator || "AND";

    if (whereArgs?.fields.length) {
        whereArgs.fields.forEach(item => {
            let seed = item.seed || whereArgs.defaultSeed;
            if (item.number) seed = Number(seed);

            const relationFilter = {
                [item.child!]: {
                    [item.search ? "search" : "contains"]:
                    seed
                }
            };
            const itemFilter = item.number ? {equals: seed} :
                {[item.search ? "search" : "contains"]: seed};

            const whereObj: { [key: string]: any } = {};
            whereObj[item.column] = item.child ?
                (item.oneToMany ? {[operator === "AND" ? "every" : "some"]: relationFilter} : relationFilter) : itemFilter;

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
    res.data = await prismaClient[model].findMany(query);

    // @ts-ignore
    const itemsCount = await prismaClient[model].count({
        where: whereWithOperator
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
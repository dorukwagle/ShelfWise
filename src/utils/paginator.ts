import FilterParams, {FilterParamsType} from "../validations/FilterParams";
import PaginationReturnTypes from "../entities/PaginationReturnTypes";
import {DEFAULT_PAGE_SIZE} from "../constants/constants";
import prismaClient from "./prismaClient";

type model = "genres" | "publishers" | "authors";
type fields = {
    id: "genreId" | "userId" | "authorId" | "publisherId";
    text: "genre" | "publisherName" | "fullName";
}

interface Args {
    res: PaginationReturnTypes;
    model: model;
    fields: fields;
}

const fetchById = async (id: string, {res, model, fields}: Args) => {
    // @ts-ignore
    res.data = (await prismaClient[model].findUnique({
        where: {
            [fields.id]: id
        }
    })) || [];
    return res;
}

const fetchBySeed = async (seed: string, {res, model, fields}: Args) => {
    // @ts-ignore
    res.data = await prismaClient[model].findMany({
        where: {
            [fields.text]: {
                contains: seed
            }
        },
    });
    return res;
}

const paginateItems = async (page: number, pageSize: number, {res, model}: Args) => {
    // @ts-ignore
    res.data = await prismaClient[model].findMany({
        skip: Math.abs((page - 1) * pageSize),
        take: pageSize
    });
    // @ts-ignore
    const itemsCount = await prismaClient[model].count();
    res.info = {
        itemsCount,
        hasNextPage: (page * pageSize) < itemsCount
    };

    return res;
}

const getPaginatedItems = async (model: model, fields: fields, filterParams: FilterParamsType) => {
    const res = {statusCode: 200} as PaginationReturnTypes;
    const validation = FilterParams.safeParse(filterParams);

    const id = validation.data?.id || null;
    const seed = validation.data?.seed || null;
    const page = validation.data?.page || 1;
    const pageSize = validation.data?.pageSize || DEFAULT_PAGE_SIZE;

    const args: Args = {res, model, fields};
    if (id)
        return await fetchById(id, args);

    if (seed)
        return await fetchBySeed(seed, args);

    if (!seed && !id)
        return await paginateItems(page, pageSize, args);

    return res;
}

export {
    getPaginatedItems,
}
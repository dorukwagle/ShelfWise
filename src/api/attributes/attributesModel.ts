import prismaClient from "../../utils/prismaClient";
import FilterParams, {FilterParamsType} from "../../validations/FilterParams";
import ModelReturnTypes from "../../entities/ModelReturnTypes";
import {PrismaClient} from "@prisma/client";
import {DEFAULT_PAGE_SIZE} from "../../constants/constants";
import PaginationReturnType from "../../entities/PaginationReturnType";

const getRoles = async (detailed: boolean) => {
    const data = await prismaClient.userRoles.findMany();
    if (detailed) return data;

    const roles: { [key: string]: number } = {};
    for (const role of data)
        roles[role.role] = role.precedence;

    return roles;
};

const getMembershipTypes = async () => {
    return prismaClient.membershipTypes.findMany();
};

const getGenres = async (genreParams: FilterParamsType) => {
    const res = {} as PaginationReturnType;
    const validation = FilterParams.safeParse(genreParams);

    const id = validation.data?.id || null;
    const seed = validation.data?.seed || null;
    const page = validation.data?.page || 1;
    const pageSize = validation.data?.pageSize || DEFAULT_PAGE_SIZE;

    if (id) {
        const genre = await prismaClient.genres.findUnique({where: {genreId: id}});
        if (genre)
            res.data = genre;
        else
            res.error = {error: "Genre not found"};
    }

    if (seed) {
        res.data = await prismaClient.genres.findMany({
            where: {
                genre: {
                    contains: seed
                }
            },
        })
        console.log(seed, res.data);
    }

    if (!seed && !id) {
        res.data = await prismaClient.genres.findMany({
            skip: Math.abs((page - 1) * pageSize),
            take: pageSize
        });
        const itemsCount = await prismaClient.genres.count();
        res.info = {
            itemsCount,
            hasNextPage: (page * pageSize) < itemsCount
        };
    }

    res.statusCode = res.error ? 400 : 200;
    return res;
};

export {
    getRoles,
    getMembershipTypes,
    getGenres
};
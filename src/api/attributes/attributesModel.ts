import prismaClient from "../../utils/prismaClient";
import {FilterParamsType} from "../../validations/FilterParams";
import {getPaginatedItems} from "../../utils/paginator";
import ModelReturnTypes from "../../entities/ModelReturnTypes";

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
    return getPaginatedItems("genres", {id: "genreId", text: "genre"}, genreParams);
};

const addGenre = async (genreName: string) => {
    return prismaClient.genres.create({
        data: {
            genre: genreName,
        }
    });
}

const genreExists = async (genreId: string) => {
    const genre = await prismaClient.genres.findUnique({where: {genreId}});
    return Boolean(genre);
}

const updateGenre = async (genreId: string, genreName: string) => {
    const res = {statusCode: 200} as ModelReturnTypes;

    if (!await genreExists(genreId)) {
        res.statusCode = 404;
        res.error = {
            message: "genre not found"
        }
        return res;
    }

    res.data = await prismaClient.genres.update({
        where: {
            genreId: genreId,
        },
        data: {
            genre: genreName
        }
    });

    return res;
}

const deleteGenre = async (genreId: string) => {
    const res = {statusCode: 200} as ModelReturnTypes;
    if (!await genreExists(genreId)) {
        res.statusCode = 404;
        res.error = {
            message: "genre not found"
        }
        return res;
    }
    await prismaClient.genres.update({where: {genreId}, data: {deletedAt: new Date()}});
    return res;
}


export {
    getRoles,
    getMembershipTypes,
    getGenres,
    addGenre,
    updateGenre,
    deleteGenre
};
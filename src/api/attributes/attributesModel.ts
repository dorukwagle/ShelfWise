import prismaClient from "../../utils/prismaClient";
import FilterParams, {FilterParamsType} from "../../validations/FilterParams";
import ModelReturnTypes from "../../entities/ModelReturnTypes";

const getRoles = async (detailed: boolean) => {
    const data = await prismaClient.userRoles.findMany();
    if (detailed) return data;

    const roles:{[key: string]: number} = {};
    for (const role of data)
        roles[role.role] = role.precedence;

    return roles;
};

const getMembershipTypes = async () => {
    return prismaClient.membershipTypes.findMany();
}

const getGenres = async (genreParams: FilterParamsType) => {
    const res = {} as ModelReturnTypes;
    const validation = FilterParams.safeParse(genreParams);

    const page = validation.data?.id || 1;
    const pageSize = validation.data?.pageSize || process.env.PAGE_SIZE || 9;
    const seed = validation.data?.seed || null;
    const id = validation.data?.id || null;

    if (id) {
        const genre = await prismaClient.genres.findUnique({where: {genreId: id}});
        if (genre)
            res.data = genre;
        else
            res.error = {error: "Genre not found"};
    }

    res.statusCode = res.error ? 400 : 200;
    return res;
};

export {
    getRoles,
    getMembershipTypes,
    getGenres
}
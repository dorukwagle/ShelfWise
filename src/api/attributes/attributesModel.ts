import prismaClient from "../../utils/prismaClient";
import {FilterParamsType} from "../../validations/FilterParams";
import {getPaginatedItems} from "../../utils/paginator";

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

export {
    getRoles,
    getMembershipTypes,
    getGenres
};
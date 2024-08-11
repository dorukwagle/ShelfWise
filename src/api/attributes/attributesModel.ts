import prismaClient from "../../utils/prismaClient";
import FilterParams, {FilterParamsType} from "../../validations/FilterParams";
import {findRecord, getPaginatedItems} from "../../utils/paginator";
import ModelReturnTypes from "../../entities/ModelReturnTypes";


const getValidParams = (data: any) => {
    return FilterParams.safeParse(data).data;
}

const genreExists = async (genreId: string) => {
    const genre = await prismaClient.genres.findUnique({where: {genreId}});
    return Boolean(genre);
}

const publisherExists = async (publisherId: string) => {
    const publisher = await prismaClient.publishers.findUnique({where: {publisherId}});
    return Boolean(publisher);
}

const authorExists = async (authorId: string) => {
    const author = await prismaClient.authors.findUnique({where: {authorId}});
    return Boolean(author);
}

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
    const data = getValidParams(genreParams);
    if (data?.id) return findRecord("genres", {seed: data?.id, fields: [{column: "genreId"}]});

    let whereArgs: any = null;

    if (data?.seed)
        whereArgs = {
            fields: [{column: "genre"}],
            seed: data?.seed,
        };

    return getPaginatedItems("genres", genreParams, whereArgs);
};

const addGenre = async (genreName: string) => {
    return prismaClient.genres.create({
        data: {
            genre: genreName,
        }
    });
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

const getPublishers = async (publisherParams: FilterParamsType) => {
    const data = getValidParams(publisherParams);
    if (data?.id)
        return findRecord("publishers", {fields: [{column: "publisherId"}], seed: data?.id});

    let whereArgs: any = null;
    if (data?.seed)
        whereArgs = {fields: ["publisherName"], seed: data?.seed};

    return getPaginatedItems("publishers", publisherParams, whereArgs);
}

const addPublisher = async (publisherName: string, address: string) => {
    return prismaClient.publishers.create({
        data: {
            publisherName: publisherName,
            address,
        }
    });
}

const updatePublisher = async (publisherId: string, publisherName: string, address: string) => {
    const res = {statusCode: 200} as ModelReturnTypes;

    if (!await publisherExists(publisherId)) {
        res.statusCode = 404;
        res.error = {
            message: "publisher not found"
        }
        return res;
    }

    res.data = await prismaClient.publishers.update({
        where: {
            publisherId,
        },
        data: {
            publisherName,
            address
        }
    });

    return res;
}

const deletePublisher = async (publisherId: string) => {
    const res = {statusCode: 200} as ModelReturnTypes;
    if (!await publisherExists(publisherId)) {
        res.statusCode = 404;
        res.error = {
            message: "publisher not found"
        }
        return res;
    }
    await prismaClient.publishers.update({where: {publisherId}, data: {deletedAt: new Date()}});
    return res;
}

const getAuthors = async (authorParams: FilterParamsType) => {
    const data = getValidParams(authorParams);
    if (data?.id)
        return findRecord("authors", {fields: [{column: "authorId"}], seed: data?.id});

    let whereArgs: any = null;
    if (data?.seed)
        whereArgs = {fields: ["fullName"], seed: data?.seed};

    return getPaginatedItems("authors", authorParams, whereArgs);
}

const addAuthor = async (title: string, authorName: string) => {
    return prismaClient.authors.create({
        data: {
            title,
            fullName: authorName,
        }
    });
}

const updateAuthor = async (authorId: string, title: string, fullName: string) => {
    const res = {statusCode: 200} as ModelReturnTypes;

    if (!await authorExists(authorId)) {
        res.statusCode = 404;
        res.error = {
            message: "author not found"
        }
        return res;
    }

    res.data = await prismaClient.authors.update({
        where: {
            authorId,
        },
        data: {
            title,
            fullName
        }
    });

    return res;
}

const deleteAuthor = async (authorId: string) => {
    const res = {statusCode: 200} as ModelReturnTypes;
    if (!await authorExists(authorId)) {
        res.statusCode = 404;
        res.error = {
            message: "publisher not found"
        }
        return res;
    }
    await prismaClient.authors.update({where: {authorId}, data: {deletedAt: new Date()}});
    return res;
}



export {
    getRoles,
    getMembershipTypes,
    getGenres,
    addGenre,
    updateGenre,
    deleteGenre,
    getPublishers,
    addPublisher,
    updatePublisher,
    deletePublisher,
    getAuthors,
    addAuthor,
    updateAuthor,
    deleteAuthor
};
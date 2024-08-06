import prismaClient from "./prismaClient";

type Exclude = {column: string, value: any};

const find = async (model: string, field: string, value: string, exclude?: Exclude) => {
    const where = exclude ? {
        [field]: value,
        NOT: {[exclude.column]: exclude.value}
    } : {
        [field]: value
    };

    // @ts-ignore
    return prismaClient[model].findUnique({
        where,
    });
};

const unique = async (model: string, field: string, value: string, exclude?: Exclude) => {
    const data = await find(model, field, value, exclude);
    return !data;
};

const exists = async (model: string, field: string, value: string, exclude?: Exclude) => {
    const data = await find(model, field, value, exclude);
    return !!data;
};

export {
    unique,
    exists
}
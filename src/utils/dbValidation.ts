import prismaClient from "./prismaClient";


const find = async (model: string, field: string, value: string) => {
    // @ts-ignore
    return prismaClient[model].findUnique({
        where: {
            [field]: value
        }
    });
};

const unique = async (model: string, field: string, value: string) => {
    const data = await find(model, field, value);
    return !data;
};

const exists = async (model: string, field: string, value: string) => {
    const data = await find(model, field, value);
    return !!data;
};

export {
    unique,
    exists
}
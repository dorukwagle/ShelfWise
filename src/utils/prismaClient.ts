import { PrismaClient } from "@prisma/client";


const databaseUrl: {[key: string]: string} = {
    "production": process.env.PRODUCTION_DATABASE_URL || "",
    "development": process.env.DEV_DATABASE_URL || "",
    "test": process.env.TEST_DATABASE_URL || "",
}

const prismaClientInstance = () => {
    return new PrismaClient({
        datasourceUrl: databaseUrl[process.env.NODE_ENV || "development"],
    });
}

declare const globalThis: {
    prismaGlobal: ReturnType<typeof prismaClientInstance>;
} & typeof global;

const prismaClient = globalThis.prismaGlobal ?? prismaClientInstance();


if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prismaClient

export default prismaClient;
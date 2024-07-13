import { PrismaClient } from "@prisma/client";


const databaseUrl: {[key: string]: string} = {
    "production": process.env.PRODUCTION_DATABASE_URL || "",
    "development": process.env.DEV_DATABASE_URL || "",
    "test": process.env.TEST_DATABASE_URL || "",
}

const prismaClient = () => {
    return new PrismaClient({
        datasourceUrl: databaseUrl[process.env.NODE_ENV || "development"],
    });
}

export default prismaClient;
import {PrismaClient} from "@prisma/client";


const databaseUrl: {[key: string]: string} = {
    "production": process.env.PRODUCTION_DATABASE_URL || "",
    "development": process.env.DEV_DATABASE_URL || "",
    "test": process.env.TEST_DATABASE_URL || "",
}

const prismaClientInstance = () => {
    return new PrismaClient({
        datasourceUrl: databaseUrl[process.env.NODE_ENV || "development"],
    })
        .$extends({
            query: {
                $allModels: {
                    $allOperations({model, operation, query, args}) {
                        if (operation.includes("create")) return query(args);
                        if (!operation.includes("delete")) // @ts-ignore
                            args.where = {...args.where, deletedAt: null};
                        return query(args);
                    }
                }
            }
        });
}

declare const globalThis: {
    prismaGlobal: ReturnType<typeof prismaClientInstance>;
} & typeof global;

const prismaClient = globalThis.prismaGlobal ?? prismaClientInstance();


if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prismaClient

export default prismaClient;
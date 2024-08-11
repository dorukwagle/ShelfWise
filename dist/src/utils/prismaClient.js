"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const databaseUrl = {
    "production": process.env.PRODUCTION_DATABASE_URL || "",
    "development": process.env.DEV_DATABASE_URL || "",
    "test": process.env.TEST_DATABASE_URL || "",
};
const prismaClientInstance = () => {
    return new client_1.PrismaClient({
        datasourceUrl: databaseUrl[process.env.NODE_ENV || "development"],
    })
        .$extends({
        query: {
            $allModels: {
                $allOperations({ model, operation, query, args }) {
                    if (operation.includes("create"))
                        return query(args);
                    if (!operation.includes("delete")) // @ts-ignore
                        args.where = Object.assign(Object.assign({}, args.where), { deletedAt: null });
                    return query(args);
                }
            }
        }
    });
};
const prismaClient = (_a = globalThis.prismaGlobal) !== null && _a !== void 0 ? _a : prismaClientInstance();
if (process.env.NODE_ENV !== 'production')
    globalThis.prismaGlobal = prismaClient;
exports.default = prismaClient;

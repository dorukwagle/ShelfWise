import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getUserInfo = async (userIdOrEmail: string,
                           includePassword=false,
                           includeChildren = true) => {
    return prisma.users.findFirst({
        where: {
            OR: [
                { email: userIdOrEmail },
                { userId: userIdOrEmail }
            ]
        },
        include: {
            role: includeChildren,
            membership: includeChildren,
        },
        omit: {
            password: !includePassword
        }
    });
}

export default getUserInfo;
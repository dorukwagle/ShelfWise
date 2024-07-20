import prismaClient from "./prismaClient";


const getUserInfo = async (userIdOrEmail: string,
                           includePassword = false,
                           includeChildren = true) => {
    return prismaClient.users.findFirst({
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
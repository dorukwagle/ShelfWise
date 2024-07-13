import prismaClient from "../src/utils/prismaClient";
import {vi} from "vitest";
import app from "../src/app";
import {hashPassword} from "../src/utils/hash";
import {Users, UserRoles as UserRolesType, MembershipTypes, Memberships} from "@prisma/client";
import {Server} from "node:http";
import {UserRoles} from "../src/constants/enum";

vi.stubEnv('NODE_ENV', 'test');


const prisma = prismaClient();


interface IEntities {
    user: Users
    userRoles: UserRolesType
    membershipType: MembershipTypes
    membership: Memberships
}

let server:Server;
const port = process.env.PORT || 3000;


const Entities: IEntities = {} as IEntities;

const executeSafely = async <T>(func: () => T) => {
    try {
        return  func();
    }
    catch (ex: any) {
        console.log(ex.message)
    }
}

const clearUpSetup = async () => {
    await prisma.sessions.deleteMany();
    await prisma.users.deleteMany();
    await prisma.userRoles.deleteMany();
    await prisma.$disconnect();
    server.close();
}

const initialSetup = async () => {
    server = app.listen(port);
    Entities.userRoles = await prisma.userRoles.create(
        {
            data: {
                role: "Manager",
                precedence: UserRoles.Manager
            }
        }
    );

    Entities.membershipType = await prisma.membershipTypes.create({
        data: {
            type: "Employee",
            precedence: 1
        }
    });

    Entities.membership = await prisma.memberships.create({
        data: {
            startDate: new Date("2021-01-01"),
            expiryDate: new Date("2022-01-01"),
            membershipTypeId: Entities.membershipType.membershipTypeId
        }
    });

    Entities.user = await prisma.users.create({
        data: {
            fullName: "Doruk Wagle",
            email: "testing@gmail.com",
            dob: new Date("2001-03-03"),
            address: "Kathmandu Nepal",
            contactNo: "9829293466",
            gender: "Male",
            roleId: Entities.userRoles.roleId,
            rollNumber: "345435345",
            password: await hashPassword("manager123"),
            accountStatus: "Active",
            enrollmentYear: "2021",
            membershipId: Entities.membership.membershipId
        }
    });
}

export {
    Entities, initialSetup, clearUpSetup, executeSafely
}


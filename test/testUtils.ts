import prismaClient from "../src/utils/prismaClient";
import {vi} from "vitest";
import {hashPassword} from "../src/utils/hash";
import {
    Users,
    UserRoles as UserRolesType,
    MembershipTypes,
    Memberships,
    GlobalAttributes,
    Genres, Authors, Publishers, Sessions, PrismaClient
} from "@prisma/client";
import {UserRoles} from "../src/constants/enum";
import {assistantManagerAuth, authorize, coordinatorAuth, managerAuth, memberAuth} from "../src/middlewares/auth";
import SessionRequest from "../src/entities/SessionRequest";
import getUserInfo from "../src/utils/userUtils";
import {startServer, stopServer} from "./singletorServer";
import app from "../src/app";
import {v7} from "uuid";
import * as fs from "node:fs";
import path from "path";

vi.stubEnv("NODE_ENV", "test");


interface IEntities {
    user: Omit<Users, "password">
    userRoles: UserRolesType
    membershipType: MembershipTypes
    membership: Memberships,
    globalAttributes: GlobalAttributes,
    genres: Genres,
    authors: Authors,
    publisher: Publishers,
    session: Sessions
}


const Entities: IEntities = {} as IEntities;
export const port = process.env.PORT || 8080;

export const testPrisma = new PrismaClient({
    datasourceUrl: process.env.TEST_DATABASE_URL,
});

export const imagesUploadPath = path.join(process.cwd(), "storage/uploads/images");

const executeSafely = async <T>(func: () => T) => {
    try {
        return func();
    } catch (ex: any) {
        console.log(ex.message);
    }
};

const clearBooksData = async () => {
    await prismaClient.books.deleteMany();
    await prismaClient.isbns.deleteMany();
    await prismaClient.bookPurchases.deleteMany();
    await prismaClient.bookWithGenres.deleteMany();
    await prismaClient.bookWithAuthors.deleteMany();
    await prismaClient.bookInfo.deleteMany();

    const basePath = process.cwd() + "/storage/uploads/images";
    const files = fs.readdirSync(basePath);
    files.forEach((file) => fs.unlinkSync(path.join(basePath, file)));
};

const clearUpSetup = async () => {
    await prismaClient.memberships.deleteMany();
    await prismaClient.sessions.deleteMany();
    await prismaClient.users.deleteMany();
    await prismaClient.userRoles.deleteMany();

    await prismaClient.authors.deleteMany();
    await prismaClient.genres.deleteMany();
    await prismaClient.globalAttributes.deleteMany();
    await prismaClient.publishers.deleteMany();

    await prismaClient.$disconnect();
    stopServer();
};

const createAuthorizationTestRoutes = () => {
    app.get("/auth", authorize, async (req: SessionRequest, res) =>
        res.status(200).send(await getUserInfo(req.session!.userId)));

    app.get("/member", memberAuth, async (req: SessionRequest, res) =>
        res.status(200).send(await getUserInfo(req.session!.userId)));

    app.get("/coordinator", coordinatorAuth, async (req: SessionRequest, res) =>
        res.status(200).send(await getUserInfo(req.session!.userId)));

    app.get("/assistant", assistantManagerAuth, async (req: SessionRequest, res) =>
        res.status(200).send(await getUserInfo(req.session!.userId)));

    app.get("/manager", managerAuth, async (req: SessionRequest, res) =>
        res.status(200).send(await getUserInfo(req.session!.userId)));
};

const initialSetup = async () => {
    startServer(port);
    Entities.userRoles = await prismaClient.userRoles.create(
        {
            data: {
                role: "Manager",
                precedence: UserRoles.Manager
            }
        }
    );

    Entities.membershipType = await prismaClient.membershipTypes.create({
        data: {
            type: "Employee",
            precedence: 1
        }
    });

    Entities.user = await prismaClient.users.create({
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
            membership: {
                create: {
                    startDate: new Date("2021-01-01"),
                    expiryDate: new Date("2022-01-01"),
                    membershipTypeId: Entities.membershipType.membershipTypeId
                }
            }
        }
    });

    Entities.membership = (await prismaClient.memberships.findUnique({
        where: {userId: Entities.user.userId}
    }))!;

    Entities.globalAttributes = await prismaClient.globalAttributes.create({
        data: {
            issueValidityDays: 7,
            membershipValidationMonths: 3,
            penaltyPerDay: 10
        }
    });

    Entities.genres = await prismaClient.genres.create({
        data: {genre: "Supernatural"}
    })!;

    Entities.authors = await prismaClient.authors.create({
        data: {title: "Ms", fullName: "Christina Rossetti"}
    });

    Entities.publisher = await prismaClient.publishers.create({
        data: {publisherName: "Eastern Coast", address: "California"}
    });

    const expires = new Date();
    expires.setDate(expires.getDate() + 1);
    Entities.session = await prismaClient.sessions.create({
        data: {
            session: v7(),
            role: "Manager",
            rolePrecedence: UserRoles.Manager,
            expiresAt: expires,
            userId: Entities.user.userId
        }
    });
};

export {
    Entities, initialSetup, clearUpSetup, executeSafely, createAuthorizationTestRoutes,
    clearBooksData
};


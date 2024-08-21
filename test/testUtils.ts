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

const createBooksMockData = async () => {
    const publisher1 = await prismaClient.publishers.create({
        data: {
            publisherName: 'Pearson Education',
            address: '221B Baker Street, London',
        },
    });

    const publisher2 = await prismaClient.publishers.create({
        data: {
            publisherName: 'O’Reilly Media',
            address: '1005 Gravenstein Highway North, Sebastopol, CA',
        },
    });

    // Create some authors
    const author1 = await prismaClient.authors.create({
        data: {
            fullName: 'J.K. Rowling',
        },
    });

    const author2 = await prismaClient.authors.create({
        data: {
            fullName: 'George R.R. Martin',
        },
    });

    const author3 = await prismaClient.authors.create({
        data: {
            fullName: 'Isaac Asimov',
        },
    });

    // Create some genres
    const genre1 = await prismaClient.genres.create({
        data: {
            genre: 'Fantasy',
        },
    });

    const genre2 = await prismaClient.genres.create({
        data: {
            genre: 'Science Fiction',
        },
    });

    // Create some books
    const book1 = await prismaClient.bookInfo.create({
        data: {
            classNumber: '001',
            bookNumber: 'B001',
            title: 'Harry Potter and the Philosopher\'s Stone',
            subTitle: 'The boy who lived, test',
            editionStatement: 'First Edition',
            numberOfPages: BigInt(223),
            publicationYear: 1997,
            coverPhoto: 'url_to_cover_photo',
            publisherId: publisher1.publisherId,
            bookAuthors: {
                create: [
                    { authorId: author1.authorId },
                ],
            },
            bookGenres: {
                create: [
                    { genreId: genre1.genreId },
                ],
            },
            isbns: {
                create: [
                    { isbn: '978-0747532699' },
                ],
            },
        },
    });

    const book2 = await prismaClient.bookInfo.create({
        data: {
            classNumber: '002',
            bookNumber: 'B002',
            title: 'A Game of Thrones',
            subTitle: 'A Song of Ice and Fire',
            editionStatement: 'First Edition',
            numberOfPages: BigInt(694),
            publicationYear: 1996,
            coverPhoto: 'url_to_cover_photo',
            publisherId: publisher2.publisherId,
            bookAuthors: {
                create: [
                    { authorId: author2.authorId },
                ],
            },
            bookGenres: {
                create: [
                    { genreId: genre1.genreId },
                ],
            },
            isbns: {
                create: [
                    { isbn: '978-0553103540' },
                ],
            },
        },
    });

    // Add more books as needed
    await prismaClient.bookInfo.create({
        data: {
            classNumber: '003',
            bookNumber: 'B003',
            title: 'Foundation',
            subTitle: 'The Galactic Empire',
            editionStatement: 'Revised Edition, test',
            numberOfPages: BigInt(255),
            publicationYear: 1951,
            coverPhoto: 'url_to_cover_photo',
            publisherId: publisher2.publisherId,
            bookAuthors: {
                create: [
                    { authorId: author3.authorId },
                ],
            },
            bookGenres: {
                create: [
                    { genreId: genre2.genreId },
                ],
            },
            isbns: {
                create: [
                    { isbn: '978-0553293357' },
                ],
            },
        },
    });

    await prismaClient.bookInfo.create({
        data: {
            classNumber: '004',
            bookNumber: 'B004',
            title: 'Dune',
            subTitle: 'The desert planet',
            editionStatement: 'First Edition, test',
            numberOfPages: BigInt(412),
            publicationYear: 1965,
            coverPhoto: 'url_to_cover_photo',
            publisherId: publisher1.publisherId,
            bookAuthors: {
                create: [
                    { authorId: author3.authorId },
                ],
            },
            bookGenres: {
                create: [
                    { genreId: genre2.genreId },
                ],
            },
            isbns: {
                create: [
                    { isbn: '978-0441013593' },
                ],
            },
        },
    });

    await prismaClient.bookInfo.create({
        data: {
            classNumber: '005',
            bookNumber: 'B005',
            title: 'The Hobbit',
            subTitle: 'There and Back Again, test',
            editionStatement: 'Second Edition',
            numberOfPages: BigInt(310),
            publicationYear: 1937,
            coverPhoto: 'url_to_cover_photo',
            publisherId: publisher1.publisherId,
            bookAuthors: {
                create: [
                    { authorId: author1.authorId },
                ],
            },
            bookGenres: {
                create: [
                    { genreId: genre1.genreId },
                ],
            },
            isbns: {
                create: [
                    { isbn: '978-0618968633' },
                ],
            },
        },
    });

    await prismaClient.bookInfo.create({
        data: {
            classNumber: '006',
            bookNumber: 'B006',
            title: 'Brave New World',
            subTitle: 'A Dystopian Masterpiece',
            editionStatement: 'First Edition',
            numberOfPages: BigInt(311),
            publicationYear: 1932,
            coverPhoto: 'url_to_cover_photo',
            publisherId: publisher2.publisherId,
            bookAuthors: {
                create: [
                    { authorId: author2.authorId }, // George R.R. Martin used here as an example
                ],
            },
            bookGenres: {
                create: [
                    { genreId: genre2.genreId }, // Science Fiction
                ],
            },
            isbns: {
                create: [
                    { isbn: '978-0060850524' },
                ],
            },
        },
    });

    await prismaClient.bookInfo.create({
        data: {
            classNumber: '007',
            bookNumber: 'B007',
            title: 'The Catcher in the Rye, test',
            subTitle: 'A Timeless Classic',
            editionStatement: 'Second Edition',
            numberOfPages: BigInt(277),
            publicationYear: 1951,
            coverPhoto: 'url_to_cover_photo',
            publisherId: publisher1.publisherId,
            bookAuthors: {
                create: [
                    { authorId: author1.authorId }, // J.K. Rowling used here as an example
                ],
            },
            bookGenres: {
                create: [
                    { genreId: genre1.genreId }, // Fantasy
                ],
            },
            isbns: {
                create: [
                    { isbn: '978-0316769488' },
                ],
            },
        },
    });

    await prismaClient.bookInfo.create({
        data: {
            classNumber: '008',
            bookNumber: 'B008',
            title: '1984',
            subTitle: 'A Dystopian Novel',
            editionStatement: 'First Edition',
            numberOfPages: BigInt(328),
            publicationYear: 1949,
            coverPhoto: 'url_to_cover_photo',
            publisherId: publisher2.publisherId,
            bookAuthors: {
                create: [
                    { authorId: author3.authorId }, // Isaac Asimov used here as an example
                ],
            },
            bookGenres: {
                create: [
                    { genreId: genre2.genreId }, // Science Fiction
                ],
            },
            isbns: {
                create: [
                    { isbn: '978-0451524935' },
                ],
            },
        },
    });

    await prismaClient.bookInfo.create({
        data: {
            classNumber: '009',
            bookNumber: 'B009',
            title: 'To Kill a Mockingbird',
            subTitle: 'A Novel of Racial Injustice',
            editionStatement: '50th Anniversary Edition',
            numberOfPages: BigInt(336),
            publicationYear: 1960,
            coverPhoto: 'url_to_cover_photo',
            publisherId: publisher1.publisherId,
            bookAuthors: {
                create: [
                    { authorId: author2.authorId }, // George R.R. Martin used here as an example
                ],
            },
            bookGenres: {
                create: [
                    { genreId: genre1.genreId }, // Fantasy
                ],
            },
            isbns: {
                create: [
                    { isbn: '978-0061120084' },
                ],
            },
        },
    });

    await prismaClient.bookInfo.create({
        data: {
            classNumber: '010',
            bookNumber: 'B010',
            title: 'The Lord of the Rings: The Fellowship of the Ring',
            subTitle: 'Part One of The Lord of the Rings',
            editionStatement: 'Revised Edition',
            numberOfPages: BigInt(423),
            publicationYear: 1954,
            coverPhoto: 'url_to_cover_photo',
            publisherId: publisher2.publisherId,
            bookAuthors: {
                create: [
                    { authorId: author1.authorId }, // J.K. Rowling used here as an example
                ],
            },
            bookGenres: {
                create: [
                    { genreId: genre1.genreId }, // Fantasy
                ],
            },
            isbns: {
                create: [
                    { isbn: '978-0547928210' },
                ],
            },
        },
    });
}

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
    await prismaClient.membershipTypes.deleteMany();

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
    clearBooksData,
    createBooksMockData
};


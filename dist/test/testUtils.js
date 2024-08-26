"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBooksMockData = exports.clearBooksData = exports.createAuthorizationTestRoutes = exports.executeSafely = exports.clearUpSetup = exports.initialSetup = exports.Entities = exports.imagesUploadPath = exports.testPrisma = exports.port = void 0;
const prismaClient_1 = __importDefault(require("../src/utils/prismaClient"));
const vitest_1 = require("vitest");
const hash_1 = require("../src/utils/hash");
const client_1 = require("@prisma/client");
const enum_1 = require("../src/constants/enum");
const auth_1 = require("../src/middlewares/auth");
const userUtils_1 = __importDefault(require("../src/utils/userUtils"));
const singletorServer_1 = require("./singletorServer");
const app_1 = __importDefault(require("../src/app"));
const uuid_1 = require("uuid");
const fs = __importStar(require("node:fs"));
const path_1 = __importDefault(require("path"));
vitest_1.vi.stubEnv("NODE_ENV", "test");
const Entities = {};
exports.Entities = Entities;
exports.port = process.env.PORT || 8080;
exports.testPrisma = new client_1.PrismaClient({
    datasourceUrl: process.env.TEST_DATABASE_URL
});
exports.imagesUploadPath = path_1.default.join(process.cwd(), "storage/uploads/images");
const executeSafely = (func) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return func();
    }
    catch (ex) {
        console.log(ex.message);
    }
});
exports.executeSafely = executeSafely;
const createBooksMockData = () => __awaiter(void 0, void 0, void 0, function* () {
    const publisher1 = yield prismaClient_1.default.publishers.create({
        data: {
            publisherName: "Pearson Education",
            address: "221B Baker Street, London"
        }
    });
    const publisher2 = yield prismaClient_1.default.publishers.create({
        data: {
            publisherName: "O’Reilly Media",
            address: "1005 Gravenstein Highway North, Sebastopol, CA"
        }
    });
    // Create some authors
    const author1 = yield prismaClient_1.default.authors.create({
        data: {
            fullName: "J.K. Rowling"
        }
    });
    const author2 = yield prismaClient_1.default.authors.create({
        data: {
            fullName: "George R.R. Martin"
        }
    });
    const author3 = yield prismaClient_1.default.authors.create({
        data: {
            fullName: "Isaac Asimov"
        }
    });
    // Create some genres
    const genre1 = yield prismaClient_1.default.genres.create({
        data: {
            genre: "Fantasy"
        }
    });
    const genre2 = yield prismaClient_1.default.genres.create({
        data: {
            genre: "Science Fiction"
        }
    });
    // Create some books
    const book1 = yield prismaClient_1.default.bookInfo.create({
        data: {
            classNumber: "001",
            bookNumber: "B001",
            title: "Harry Potter and the Philosopher's Stone",
            subTitle: "The boy who lived, test",
            editionStatement: "First Edition",
            numberOfPages: BigInt(223),
            publicationYear: 1997,
            coverPhoto: "url_to_cover_photo",
            publisherId: publisher1.publisherId,
            bookAuthors: {
                create: [
                    { authorId: author1.authorId }
                ]
            },
            bookGenres: {
                create: [
                    { genreId: genre1.genreId }
                ]
            },
            isbns: {
                create: [
                    { isbn: "978-0747532699" }
                ]
            }
        }
    });
    const book2 = yield prismaClient_1.default.bookInfo.create({
        data: {
            classNumber: "002",
            bookNumber: "B002",
            title: "A Game of Thrones",
            subTitle: "A Song of Ice and Fire",
            editionStatement: "First Edition",
            numberOfPages: BigInt(694),
            publicationYear: 1996,
            coverPhoto: "url_to_cover_photo",
            publisherId: publisher2.publisherId,
            bookAuthors: {
                create: [
                    { authorId: author2.authorId }
                ]
            },
            bookGenres: {
                create: [
                    { genreId: genre1.genreId }
                ]
            },
            isbns: {
                create: [
                    { isbn: "978-0553103540" }
                ]
            }
        }
    });
    // Add more books as needed
    const book3 = yield prismaClient_1.default.bookInfo.create({
        data: {
            classNumber: "003",
            bookNumber: "B003",
            title: "Foundation",
            subTitle: "The Galactic Empire",
            editionStatement: "Revised Edition, test",
            numberOfPages: BigInt(255),
            publicationYear: 1951,
            coverPhoto: "url_to_cover_photo",
            publisherId: publisher2.publisherId,
            bookAuthors: {
                create: [
                    { authorId: author3.authorId }
                ]
            },
            bookGenres: {
                create: [
                    { genreId: genre2.genreId }
                ]
            },
            isbns: {
                create: [
                    { isbn: "978-0553293357" }
                ]
            }
        }
    });
    const book4 = yield prismaClient_1.default.bookInfo.create({
        data: {
            classNumber: "004",
            bookNumber: "B004",
            title: "Dune",
            subTitle: "The desert planet",
            editionStatement: "First Edition, test",
            numberOfPages: BigInt(412),
            publicationYear: 1965,
            coverPhoto: "url_to_cover_photo",
            publisherId: publisher1.publisherId,
            bookAuthors: {
                create: [
                    { authorId: author3.authorId }
                ]
            },
            bookGenres: {
                create: [
                    { genreId: genre2.genreId }
                ]
            },
            isbns: {
                create: [
                    { isbn: "978-0441013593" }
                ]
            }
        }
    });
    const book5 = yield prismaClient_1.default.bookInfo.create({
        data: {
            classNumber: "005",
            bookNumber: "B005",
            title: "The Hobbit",
            subTitle: "There and Back Again, test",
            editionStatement: "Second Edition",
            numberOfPages: BigInt(310),
            publicationYear: 1937,
            coverPhoto: "url_to_cover_photo",
            publisherId: publisher1.publisherId,
            bookAuthors: {
                create: [
                    { authorId: author1.authorId }
                ]
            },
            bookGenres: {
                create: [
                    { genreId: genre1.genreId }
                ]
            },
            isbns: {
                create: [
                    { isbn: "978-0618968633" }
                ]
            }
        }
    });
    const book6 = yield prismaClient_1.default.bookInfo.create({
        data: {
            classNumber: "006",
            bookNumber: "B006",
            title: "Brave New World",
            subTitle: "A Dystopian Masterpiece",
            editionStatement: "First Edition",
            numberOfPages: BigInt(311),
            publicationYear: 1932,
            coverPhoto: "url_to_cover_photo",
            publisherId: publisher2.publisherId,
            bookAuthors: {
                create: [
                    { authorId: author2.authorId } // George R.R. Martin used here as an example
                ]
            },
            bookGenres: {
                create: [
                    { genreId: genre2.genreId } // Science Fiction
                ]
            },
            isbns: {
                create: [
                    { isbn: "978-0060850524" }
                ]
            }
        }
    });
    const book7 = yield prismaClient_1.default.bookInfo.create({
        data: {
            classNumber: "007",
            bookNumber: "B007",
            title: "The Catcher in the Rye, test",
            subTitle: "A Timeless Classic",
            editionStatement: "Second Edition",
            numberOfPages: BigInt(277),
            publicationYear: 1951,
            coverPhoto: "url_to_cover_photo",
            publisherId: publisher1.publisherId,
            bookAuthors: {
                create: [
                    { authorId: author1.authorId } // J.K. Rowling used here as an example
                ]
            },
            bookGenres: {
                create: [
                    { genreId: genre1.genreId } // Fantasy
                ]
            },
            isbns: {
                create: [
                    { isbn: "978-0316769488" }
                ]
            }
        }
    });
    const book8 = yield prismaClient_1.default.bookInfo.create({
        data: {
            classNumber: "008",
            bookNumber: "B008",
            title: "1984",
            subTitle: "A Dystopian Novel",
            editionStatement: "First Edition",
            numberOfPages: BigInt(328),
            publicationYear: 1949,
            coverPhoto: "url_to_cover_photo",
            publisherId: publisher2.publisherId,
            bookAuthors: {
                create: [
                    { authorId: author3.authorId } // Isaac Asimov used here as an example
                ]
            },
            bookGenres: {
                create: [
                    { genreId: genre2.genreId } // Science Fiction
                ]
            },
            isbns: {
                create: [
                    { isbn: "978-0451524935" }
                ]
            }
        }
    });
    const book9 = yield prismaClient_1.default.bookInfo.create({
        data: {
            classNumber: "009",
            bookNumber: "B009",
            title: "To Kill a Mockingbird",
            subTitle: "A Novel of Racial Injustice",
            editionStatement: "50th Anniversary Edition",
            numberOfPages: BigInt(336),
            publicationYear: 1960,
            coverPhoto: "url_to_cover_photo",
            publisherId: publisher1.publisherId,
            bookAuthors: {
                create: [
                    { authorId: author2.authorId } // George R.R. Martin used here as an example
                ]
            },
            bookGenres: {
                create: [
                    { genreId: genre1.genreId } // Fantasy
                ]
            },
            isbns: {
                create: [
                    { isbn: "978-0061120084" }
                ]
            }
        }
    });
    const book10 = yield prismaClient_1.default.bookInfo.create({
        data: {
            classNumber: "010",
            bookNumber: "B010",
            title: "The Lord of the Rings: The Fellowship of the Ring",
            subTitle: "Part One of The Lord of the Rings",
            editionStatement: "Revised Edition",
            numberOfPages: BigInt(423),
            publicationYear: 1954,
            coverPhoto: "url_to_cover_photo",
            publisherId: publisher2.publisherId,
            bookAuthors: {
                create: [
                    { authorId: author1.authorId } // J.K. Rowling used here as an example
                ]
            },
            bookGenres: {
                create: [
                    { genreId: genre1.genreId } // Fantasy
                ]
            },
            isbns: {
                create: [
                    { isbn: "978-0559128224" },
                    { isbn: "978-05479228219" },
                    { isbn: "978-05478122163" }
                ]
            }
        }
    });
    Entities.bookInfos = [book10, book2, book3, book4, book5, book6, book7, book8, book9, book1];
});
exports.createBooksMockData = createBooksMockData;
const clearBooksData = () => __awaiter(void 0, void 0, void 0, function* () {
    yield prismaClient_1.default.books.deleteMany();
    yield prismaClient_1.default.isbns.deleteMany();
    yield prismaClient_1.default.bookPurchases.deleteMany();
    yield prismaClient_1.default.bookWithGenres.deleteMany();
    yield prismaClient_1.default.bookWithAuthors.deleteMany();
    yield prismaClient_1.default.bookInfo.deleteMany();
    const basePath = process.cwd() + "/storage/uploads/images";
    const files = fs.readdirSync(basePath);
    files.forEach((file) => fs.unlinkSync(path_1.default.join(basePath, file)));
});
exports.clearBooksData = clearBooksData;
const clearUpSetup = () => __awaiter(void 0, void 0, void 0, function* () {
    yield prismaClient_1.default.memberships.deleteMany();
    yield prismaClient_1.default.sessions.deleteMany();
    yield prismaClient_1.default.users.deleteMany();
    yield prismaClient_1.default.userRoles.deleteMany();
    yield prismaClient_1.default.authors.deleteMany();
    yield prismaClient_1.default.genres.deleteMany();
    yield prismaClient_1.default.globalAttributes.deleteMany();
    yield prismaClient_1.default.publishers.deleteMany();
    yield prismaClient_1.default.membershipTypes.deleteMany();
    yield prismaClient_1.default.$disconnect();
    (0, singletorServer_1.stopServer)();
});
exports.clearUpSetup = clearUpSetup;
const createAuthorizationTestRoutes = () => {
    app_1.default.get("/auth", auth_1.authorize, (req, res) => __awaiter(void 0, void 0, void 0, function* () { return res.status(200).send(yield (0, userUtils_1.default)(req.session.userId)); }));
    app_1.default.get("/member", auth_1.memberAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () { return res.status(200).send(yield (0, userUtils_1.default)(req.session.userId)); }));
    app_1.default.get("/coordinator", auth_1.coordinatorAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () { return res.status(200).send(yield (0, userUtils_1.default)(req.session.userId)); }));
    app_1.default.get("/assistant", auth_1.assistantManagerAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () { return res.status(200).send(yield (0, userUtils_1.default)(req.session.userId)); }));
    app_1.default.get("/manager", auth_1.managerAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () { return res.status(200).send(yield (0, userUtils_1.default)(req.session.userId)); }));
    app_1.default.get("/membership-test", auth_1.withMembership, (req, res) => __awaiter(void 0, void 0, void 0, function* () { return res.status(200).send({ message: "Membership test" }); }));
};
exports.createAuthorizationTestRoutes = createAuthorizationTestRoutes;
const initialSetup = () => __awaiter(void 0, void 0, void 0, function* () {
    (0, singletorServer_1.startServer)(exports.port);
    Entities.userRoles = yield prismaClient_1.default.userRoles.create({
        data: {
            role: "Manager",
            precedence: enum_1.UserRoles.Manager
        }
    });
    Entities.membershipType = yield prismaClient_1.default.membershipTypes.create({
        data: {
            type: "Employee",
            precedence: 1
        }
    });
    Entities.user = yield prismaClient_1.default.users.create({
        data: {
            fullName: "Doruk Wagle",
            email: "testing@gmail.com",
            dob: new Date("2001-03-03"),
            address: "Kathmandu Nepal",
            contactNo: "9829293466",
            gender: "Male",
            roleId: Entities.userRoles.roleId,
            rollNumber: "345435345",
            password: yield (0, hash_1.hashPassword)("manager123"),
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
    Entities.membership = (yield prismaClient_1.default.memberships.findUnique({
        where: { userId: Entities.user.userId }
    }));
    Entities.globalAttributes = yield prismaClient_1.default.globalAttributes.create({
        data: {
            issueValidityDays: 7,
            membershipValidationMonths: 3,
            penaltyPerDay: 10
        }
    });
    Entities.genres = yield prismaClient_1.default.genres.create({
        data: { genre: "Supernatural" }
    });
    Entities.authors = yield prismaClient_1.default.authors.create({
        data: { title: "Ms", fullName: "Christina Rossetti" }
    });
    Entities.publisher = yield prismaClient_1.default.publishers.create({
        data: { publisherName: "Eastern Coast", address: "California" }
    });
    const expires = new Date();
    expires.setDate(expires.getDate() + 1);
    Entities.session = yield prismaClient_1.default.sessions.create({
        data: {
            session: (0, uuid_1.v7)(),
            role: "Manager",
            rolePrecedence: enum_1.UserRoles.Manager,
            expiresAt: expires,
            userId: Entities.user.userId
        }
    });
});
exports.initialSetup = initialSetup;

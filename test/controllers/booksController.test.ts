import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, it} from "vitest";
import {
    clearUpSetup,
    initialSetup,
    Entities,
    clearBooksData,
    executeSafely,
    port,
    imagesUploadPath
} from "../testUtils";
import FetchRequest from "../FetchRequest";
import request from "supertest";
import prismaClient from "../../src/utils/prismaClient";
import * as fs from "fs";
import path from "path";
import {BookInfo} from "@prisma/client";


describe("BooksController", async () => {
    const filePath = "./test/assets/fileTest.jpg";
    let bookPayload: { [key: string]: any };

    const getAgent = () => {
        const agent = request(`http://localhost:${port}`)
            .post(`/api/books`)
            .attach("coverPhoto", filePath)
            .set("Cookie", `sessionId=${Entities.session.session}`);

        for (const key in bookPayload) {
            const value = bookPayload[key];
            const tp = typeof value;
            agent.field(tp === "object" ? `${key}[]` : key,
                bookPayload[key]);
        }
        return agent;
    };

    const reallocatePayload = () => {
        bookPayload = {
            classNumber: "958347983",
            bookNumber: "9837459837",
            title: "hello test book",
            subTitle: "subtitle",
            editionStatement: "hello edition",
            numberOfPages: 387,
            publicationYear: "2019",
            seriesStatement: "hello series",
            publisherId: "",
            bookAuthors: [""],
            isbns: ["34345353", "34534512", "898734"],
            bookGenres: [""],
            pricePerPiece: 345,
            totalPieces: 5,
            barcodes: ["53487593844", "8923489243", "3768287382", "34535", "34545345"]
        };

        bookPayload.bookAuthors = [Entities.authors.authorId];
        bookPayload.publisherId = Entities.publisher.publisherId;
        bookPayload.bookGenres = [Entities.genres.genreId];
    }

    describe("POST /api/books", async () => {
        const req = new FetchRequest(`http://localhost:${port}/api/books`)
            .setDefaultHeaders();

        beforeAll(async () => {
            await initialSetup();
        });

        afterAll(async () => {
            await clearUpSetup();
        });

        beforeEach(async () => {
            reallocatePayload();

            req.reset()
                .setDefaultHeaders()
                .setCookie("sessionId", Entities.session.session);
        });

        afterEach(async () => {
            await clearBooksData();
        });

        it("should return 400 response if cover image is not sent", async () => {
            const res = await executeSafely(() => req.post("?", bookPayload));
            const data = await res!.json();

            expect.soft(res!.status).toBe(400);
            expect.soft(data.error).toContain("please upload");
        });

        it("should return 400 if totalPieces and barcodes number are not equal", async () => {
            bookPayload.totalPieces = 8;

            const res = await getAgent().expect(400);

            const data = res.body;
            expect.soft(data.error).toContain("mismatch");
        });

        // it should add book to the book info database
        it("should add book to the database if valid request sent", async () => {
            await getAgent().expect(200);

            const book = await prismaClient.bookInfo.findFirst({
                include: {
                    publisher: true,
                    purchases: true
                }
            });

            const expected = {
                classNumber: bookPayload.classNumber,
                bookNumber: bookPayload.bookNumber,
                numberOfPages: BigInt(bookPayload.numberOfPages),
                publisher: {
                    publisherName: Entities.publisher.publisherName
                },
                purchases: [
                    {
                        totalPieces: bookPayload.totalPieces,
                        pricePerPiece: bookPayload.pricePerPiece
                    }
                ]
            };

            expect.soft(book).toMatchObject(expected);
        });

        it("should add barcodes and isbns to the book table equal to given numbers", async () => {
            await getAgent().expect(200);

            const barcodes = await prismaClient.books.findMany();
            const isbns = await prismaClient.isbns.findMany();

            expect.soft(barcodes.length).toBe(bookPayload.barcodes.length);
            expect.soft(isbns.length).toBe(bookPayload.isbns.length);
        });

        it("should upload and store the photo in the storage saving the name in the database", async () => {
            await getAgent().expect(200);

            const book = await prismaClient.bookInfo.findFirst();

            expect.soft(fs.existsSync(path.join(imagesUploadPath, book!.coverPhoto))).toBeTruthy();
        });
    });

    describe("PUT /api/books/info/:infoId", async () => {
        let bookInfo: BookInfo;

        beforeAll(async () => {
            await initialSetup();
        });

        afterAll(async () => {
            await clearUpSetup();
        });

        beforeEach(async () => {
            reallocatePayload();

            const res = await getAgent().expect(200);
            bookInfo = res.body;
        });

        afterEach(async () => {
            await clearBooksData();
        });

        const getUpdateAgent = (id: string) => {
            return request(`http://localhost:${port}`)
                .put(`/api/books/info/${id}`)
                .set("Cookie", `sessionId=${Entities.session.session}`)
                .send(bookPayload);
        };

        it("should return 404 error if invalid bookInfoId is given", async () => {
            const res = await getUpdateAgent("sdlkf32424")
                .expect(404);
            expect.soft(res.body.error).toContain('not found');
        });

        it("should update the bookInfo with the new data", async () => {
            bookPayload.classNumber = "98989898";
            bookPayload.bookNumber = "98989897";
            bookPayload.numberOfPages = 501;

            const res = await getUpdateAgent(bookInfo.bookInfoId).expect(200);
            const data = res.body;

            expect.soft(data).toMatchObject({
                classNumber: "98989898",
                bookNumber: "98989897",
                numberOfPages: 501,
            });
        });

       describe("PUT /api/books/info/:infoId/coverphoto", async () => {
           it("should return 400 if photo is not sent", async () => {

           });

           it("should update the coverPhoto once the file is sent", async () => {

           });
       })
    });
});


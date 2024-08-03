import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, it} from "vitest";
import {clearUpSetup, initialSetup, Entities, clearBooksData, executeSafely, port} from "../testUtils";
import FetchRequest from "../FetchRequest";
import request from "supertest";


describe("BooksController", async () => {
    describe("POST /api/books", async () => {
        const req = new FetchRequest(`http://localhost:${port}/api/books`)
            .setDefaultHeaders();
        const filePath = "./test/assets/fileTest.jpg";

        const bookPayload: { [key: string]: any } = {
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
            totalPieces: 6,
            barcodes: ["53487593844", "8923489243", "3768287382", "34535", "34545345"]
        };

        beforeAll(async () => {
            await initialSetup();
        });

        afterAll(async () => {
            await clearUpSetup();
        });

        beforeEach(async () => {
            bookPayload.bookAuthors = [Entities.authors.authorId];
            bookPayload.publisherId = Entities.publisher.publisherId;
            bookPayload.bookGenres = [Entities.genres.genreId];

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

            req.reset()
                .setHeaders(new Headers({
                    "Accept": "application/json",
                }))
                .setCookie("sessionId", Entities.session.session);

            const agent = request(`http://localhost:${port}`)
                .post(`/api/books`)
                .attach("coverPhoto", filePath)
                .set("Cookie", `sessionId=${Entities.session.session}`)

            for (const key in bookPayload) {
                const value = bookPayload[key];
                const tp = typeof value;
                agent.field(tp === "object" ? `${key}[]` : key,
                    bookPayload[key]);
            }
            const res = await agent.expect(400);

            const data = res.body;
            expect.soft(res!.status).toBe(400);
            expect.soft(data.error).toContain("mismatch");
        });
        // it should return 400 duplicate response, if duplicate barcodes value are sent
        // it should return 400 if pre-existing isbn is sent
        // it should add book to the book info database
        // it should add barcodes to the book table equal to the total books pieces
        // it should populate related tables. i.e. genres, publishers, authors, isbns
    });
});


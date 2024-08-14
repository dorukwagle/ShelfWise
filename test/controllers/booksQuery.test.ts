import {afterAll, beforeAll, describe, expect, it} from "vitest";
import {
    clearBooksData,
    clearUpSetup,
    createBooksMockData,
    Entities,
    executeSafely,
    initialSetup,
    port
} from "../testUtils";
import FetchRequest from "../FetchRequest";
import {DEFAULT_PAGE_SIZE} from "../../src/constants/constants";
import prismaClient from "../../src/utils/prismaClient";

describe("Books Query", async () => {
    beforeAll(async () => {
        await initialSetup();
        await createBooksMockData();
    });

    afterAll(async () => {
        await clearBooksData();
        await clearUpSetup();
    });

    describe("GET /api/books", async () => {
        const req = new FetchRequest(`http://localhost:${port}/api/books`)
            .setDefaultHeaders();

        beforeAll(async () => {
            req.setCookie("sessionId", Entities.session.session);
        });

        it("should return default page size elements if no filter is given", async () => {
            const res = await executeSafely(() => req.get());
            const realDataLen = await prismaClient.bookInfo.count();

            const {data, info} = await res!.json();

            expect.soft(res!.status).toBe(200);
            expect.soft(data.length).toBe(DEFAULT_PAGE_SIZE);
            expect.soft(info).toHaveProperty("hasNextPage");
            expect.soft(info.itemsCount).toBe(realDataLen);
        });

        it("should return books with matching title or subtitle with given seed", async () => {
            const res = await executeSafely(() => req.get("?", {seed: "dystopian"}));

            const {data} = await res!.json();

            expect.soft(res!.status).toBe(200);
            data.forEach((book: any) => {
               expect.soft((book.title + book.subTitle).toLowerCase()).toContain("dystopian");
            });
        });

        it("should return books with given genre", async () => {
            const genres = await prismaClient.genres.findMany();
            const genreId = genres[1].genreId;

            const res = await executeSafely(() => req.get("?", {genre: genreId}));

            const {data} = await res!.json();

            expect.soft(data.length).toBeTruthy();

            data.forEach((book: any) => {
                expect.soft(book.bookGenres[0].genreId).toBe(genreId);
            });
        });

        it("should return books with given publisher", async () => {
            const publishers = await prismaClient.publishers.findMany();
            const publisher = publishers[1].publisherId;

            const res = await executeSafely(() => req.get("?", {publisher: publisher}));
            const {data} = await res!.json();

            expect.soft(res!.status).toBe(200);
            expect.soft(data.length).toBeTruthy();
            data.forEach((book: any) => {
                expect.soft(book.publisher.publisherId).toBe(publisher);
            });
        });

        it("should return books with given authors", async () => {
            const authors = await prismaClient.authors.findMany();
            const author = authors[1].authorId;

            const res = await executeSafely(() => req.get("?", {author: author}));
            const {data} = await res!.json();

            expect.soft(res!.status).toBe(200);
            expect.soft(data.length).toBeTruthy();
            data.forEach((book: any) => {
                expect.soft(book.bookAuthors[0].authorId).toBe(author);
            });
        });

        it("should return books with matching conditions, genre, publisher, authors & seed and sorted", async () => {
            const authors = await prismaClient.authors.findMany();
            const publishers = await prismaClient.publishers.findMany();
            const genres = await prismaClient.genres.findMany();

            const publisher = publishers[1].publisherId;
            const genre = genres[1].genreId;
            const author = authors[1].authorId;

            const res = await executeSafely(() => req.get("?", {
                author, genre, publisher,
                sort: "pub_date_asc"
            }));

            const {data} = await res!.json();
            expect.soft(res!.status).toBe(200);
            expect.soft(data.length).toBeTruthy();

            for (let i = 1; i < data.length; i++) {
                const date1 = new Date(data[i].publicationYear);
                const date2 = new Date(data[i - 1].publicationYear);
                expect.soft(date2 > date1);
            }

            data.forEach((book: any) => {
                expect.soft(book.bookAuthors[0].authorId).toBe(author);
                expect.soft(book.bookGenres[0].genreId).toBe(genre);
                expect.soft(book.publisher.publisherId).toBe(publisher);
                expect.soft((book.title + book.subTitle).toLowerCase()).toContain("");
            });

        });
    });

    describe("GET /api/books/find", async () => {
        it("should return books with given number of pages", async () => {

        });

        it("should return books with given barcode", async () => {

        });
    });
});
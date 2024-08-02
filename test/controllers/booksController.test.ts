import {afterAll, afterEach, beforeAll, beforeEach, describe} from "vitest";
import {clearUpSetup, initialSetup, Entities, clearBooksData} from "../testUtils";

describe("BooksController", async () => {
    describe("POST /api/books", async () => {
        const bookPayload = {
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
        }

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
        });

        afterEach(async () => {
            await clearBooksData();
        });


    });
});


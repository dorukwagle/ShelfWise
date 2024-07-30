import {afterEach, beforeAll, beforeEach, describe, expect, it} from "vitest";
import {clearUpSetup, Entities, executeSafely, initialSetup, port} from "../testUtils";
import prismaClient from "../../src/utils/prismaClient";
import FetchRequest from "../FetchRequest";
import {FilterParamsType} from "../../src/validations/FilterParams";
import {v7} from "uuid";
import {DEFAULT_PAGE_SIZE} from "../../src/constants/constants";
import exp from "node:constants";
import {PrismaClient} from "@prisma/client";


describe("Genres", async () => {
    const totalGenres = 33;
    beforeEach(async () => {
       await initialSetup();
    });

    afterEach(async () => {
        await clearUpSetup();
    });

    describe("GET /api/attributes/genres", async () => {
        const req = new FetchRequest(`http://localhost:${port}/api/attributes/genres`)
            .setDefaultHeaders();
        let genreParams: FilterParamsType;

        beforeEach(async () => {
            await prismaClient.genres.deleteMany();
            const data = [];
            for (let i = 1; i <= totalGenres; i++)
                data.push({genre: `test${i}`})
            await prismaClient.genres.createMany({
                data
            });
            genreParams = {};
        });

        afterEach(async () => {
            await prismaClient.genres.deleteMany();
        });

        it("should return empty array if invalid genre id is given", async () => {
            genreParams.id = v7();
            const res = await executeSafely(() => req.get("?", genreParams));

            expect.soft(res).toBeTruthy();

            expect.soft(res!.status).toBe(200);

            const {data} = await res!.json();
            expect.soft(data).toMatchObject([]);
        });

        it("should return the genre if the genre id is given", async () => {
            const genre = await prismaClient.genres.create({
               data: {
                   genre: "test genre"
               }
            });

            genreParams.id = genre.genreId;

            const res = await executeSafely(() => req.get("?", genreParams));
            const {data} = await res!.json();

            expect.soft(res!.status).toBe(200);
            expect.soft(data).toMatchObject(JSON.parse(JSON.stringify(genre)));
        });

        it("should return the default pagination contents if no pagination filters are given", async () => {
            const res = await executeSafely(() => req.get("?"));

            expect.soft(res!.status).toBe(200);

            const {data} = await res!.json();
            expect.soft(data[0].genre).toBe("test1");
            expect.soft(data[data.length - 1].genre).toBe("test9"); // 9 items default size
        });

        it("should return the given page with default size if page is given", async () => {
            genreParams.page = 2;

            const res = await executeSafely(() => req.get("?", genreParams));

            expect.soft(res!.status).toBe(200);

            const {data} = await res!.json();
            expect.soft(data.length).toBe(DEFAULT_PAGE_SIZE);
            expect.soft(data[0].genre).toBe("test10");
        });

        it("should return given page of given size if size and page are given", async () => {
            genreParams.page = 3;
            genreParams.pageSize = 7;

            const res = await executeSafely(() => req.get("?", genreParams));

            expect.soft(res!.status).toBe(200);

            const {data} = await res!.json();
            expect.soft(data.length).toBe(genreParams.pageSize);
            // 1-7, 8-14, 15-22 // 7 items per page, requested 3rd page
            expect.soft(data[0].genre).toBe("test15");
            expect.soft(data[data.length - 1].genre).toBe("test21");
        });

        it("should return hasNextPage and itemsCount as per pagination", async () => {
            genreParams.page = 3;
            genreParams.pageSize = 7;
            const res1 = await executeSafely(() => req.get("?", genreParams));

            genreParams.page = 4;
            genreParams.pageSize = 10;
            const res2 = await executeSafely(() => req.get("?", genreParams));

            expect.soft(res1!.status).toBe(200);
            expect.soft(res2!.status).toBe(200);

            const data1 = await res1!.json();
            const data2 = await res2!.json();

            expect.soft(data1.info.hasNextPage).toBeTruthy();
            expect.soft(data2.info.hasNextPage).toBeFalsy();
            expect.soft(data1.info.itemsCount).toBe(totalGenres);
            expect.soft(data2.info.itemsCount).toBe(totalGenres);

            expect.soft(data2.data[data2.data.length - 1].genre).toBe("test33");
            expect.soft(data2.data.length).toBe(totalGenres - ((genreParams.page - 1) * genreParams.pageSize));
        });

        it("should return default page sized with the matching items if seed is given", async () => {
            genreParams.seed = "21";
            const res = await executeSafely(() => req.get("?", genreParams));

            expect.soft(res!.status).toBe(200);

            const {data} = await res!.json();

            expect.soft(data[0].genre).toContain(genreParams.seed);

        });

        it("should add new genre and save in database if post request is sent", async () => {
            const genre = "damn good";

            const res = await executeSafely(() => req.post("?", {
                genre
            }));

            expect.soft(res!.status).toBe(200);
            const data = await prismaClient.genres.findFirst({
                where: {
                    genre
                }
            });

            expect.soft(data).toBeTruthy();
        });

        it("should delete genre if delete request is sent", async () => {
            const genre = await prismaClient.genres.findFirst();
            const res = await executeSafely(() => req.delete(genre!.genreId));

            expect.soft(res!.status).toBe(200);
            const testData = await (new PrismaClient()).genres.findUnique({
                where: {genreId: genre!.genreId}
            });
            expect.soft(testData!.deletedAt).toBeTruthy();
        });

        it("should not return deleted genre get request is sent", async () => {
            const genre = await prismaClient.genres.create({
                data: {
                    genre: "hello test",
                    deletedAt: new Date(),
                }
            });

            genreParams.id = genre.genreId;
            const res = await executeSafely(() => req.reset().get("?", genreParams));
            expect.soft(res!.status).toBe(200);

            const {data} = await res!.json();
            expect.soft(data).toMatchObject([]);
        });
    });
});
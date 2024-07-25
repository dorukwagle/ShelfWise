import {afterEach, beforeAll, beforeEach, describe, expect, it} from "vitest";
import {clearUpSetup, Entities, executeSafely, initialSetup, port} from "../testUtils";
import prismaClient from "../../src/utils/prismaClient";
import FetchRequest from "../FetchRequest";
import {FilterParamsType} from "../../src/validations/FilterParams";
import {v7} from "uuid";


describe("Genres", async () => {

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
            await prismaClient.genres.createMany({
                data: [
                    {genre: "test1"},
                    {genre: "test2"},
                    {genre: "test3"},
                    {genre: "test4"},
                    {genre: "test5"},
                    {genre: "test6"},
                    {genre: "test7"},
                    {genre: "test8"},
                    {genre: "test9"},
                    {genre: "test10"},
                    {genre: "test11"},
                ]
            });
            genreParams = {};
        });

        afterEach(async () => {
            await prismaClient.genres.deleteMany();
        });

        it("should return error if invalid genre id is given", async () => {
            genreParams.id = v7();
            const res = await executeSafely(() => req.get("?", genreParams));

            expect.soft(res).toBeTruthy();

            expect.soft(res!.status).toBe(400);

            const data = await res!.json();
            expect.soft(data.error).toContain("not found");
        });

        it("should return the genre if the genre id is given", async () => {
            const genre = await prismaClient.genres.create({
               data: {
                   genre: "test genre"
               }
            });

            genreParams.id = genre.genreId;

            const res = await executeSafely(() => req.get("?", genreParams));
            const data = await res!.json();

            expect.soft(res!.status).toBe(200);
            expect.soft(data).toMatchObject(JSON.parse(JSON.stringify(genre)));
        });

        it.skip("should return the default pagination contents if no pagination filters are given", async () => {
            const res = await executeSafely(() => req.get("?", genreParams));
            const query = await prismaClient.genres.findMany();

            expect.soft(query).toBeTruthy();
            expect.soft(res!.status).toBe(200);

            const data = await res!.json();
            expect(data.length).toBe(query.length);
        });
        // should return the given page with default size if page no. given
        // should return given page and size if size and page are given
        // should return hasNextPage and itemsCount as per pagination
        // should return default page size with matching items if seed is given
    });

    // describe("POST /api/attributes/genres", async () => {
    //     // create new genre if valid data given
    // });
    //
    // describe("PUT /api/attributes/genres/:genreId", async () => {
    //     // update the given genre
    // });
    //
    // describe("DELETE /api/attributes/genres/:genreId", async () => {
    //     // delete the given genre
    // })
});
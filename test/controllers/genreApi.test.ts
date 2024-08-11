import {afterEach, beforeEach, describe, expect, it} from "vitest";
import {clearUpSetup, Entities, executeSafely, initialSetup, port, testPrisma} from "../testUtils";
import prismaClient from "../../src/utils/prismaClient";
import FetchRequest from "../FetchRequest";
import {FilterParamsType} from "../../src/validations/FilterParams";
import {v7} from "uuid";
import {DEFAULT_PAGE_SIZE} from "../../src/constants/constants";
import {PrismaClient} from "@prisma/client";


describe("Attributes", async () => {
    describe("Genres API", async () => {
        const totalGenres = 33;

        const req = new FetchRequest(`http://localhost:${port}/api/attributes/genres`)
            .setDefaultHeaders();
        let genreParams
            :
            FilterParamsType;

        beforeEach(async () => {
            await initialSetup();

            await prismaClient.genres.deleteMany();
            const data = [];
            for (let i = 1; i <= totalGenres; i++)
                data.push({genre: `test${i}`});
            await prismaClient.genres.createMany({
                data
            });
            genreParams = {};

            req.setCookie("sessionId", Entities.session.session)
        });

        afterEach(async () => {
            await prismaClient.genres.deleteMany();
            await clearUpSetup();
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

        it("should update the genre in the database if update request is sent", async () => {
            const updated = {
                genre: "hello genre"
            };

            const genre = await prismaClient.genres.create({
                data: {
                    genre: "testing genre"
                }
            });

            const res = await executeSafely(() => req.put(genre.genreId, updated));
            const tally = await prismaClient.genres.findUnique({where: {genreId: genre.genreId}});

            expect.soft(res!.status).toBe(200);
            expect.soft(tally!.genre).toBe(updated.genre);
        });

        it("should delete genre if delete request is sent", async () => {
            const genre = await prismaClient.genres.findFirst();
            const res = await executeSafely(() => req.delete(genre!.genreId));

            expect.soft(res!.status).toBe(200);
            const testData = await testPrisma.genres.findUnique({
                where: {genreId: genre!.genreId}
            });
            expect.soft(testData!.deletedAt).toBeTruthy();
        });

        it("should not return deleted genre get request is sent", async () => {
            const genre = await prismaClient.genres.create({
                data: {
                    genre: "hello test",
                    deletedAt: new Date()
                }
            });

            genreParams.id = genre.genreId;
            const res = await executeSafely(() => req.reset().get("?", genreParams));
            expect.soft(res!.status).toBe(200);

            const {data} = await res!.json();
            expect.soft(data).toMatchObject([]);
        });
    });

    describe("Publishers API", async () => {
        const totalPublishers = 34;

        const req = new FetchRequest(`http://localhost:${port}/api/attributes/publishers`)
            .setDefaultHeaders();
        let pubParams
            :
            FilterParamsType;

        beforeEach(async () => {
            await initialSetup();

            await prismaClient.publishers.deleteMany();
            const data = [];
            for (let i = 1; i <= totalPublishers; i++)
                data.push({publisherName: `test${i}`, address: `testAddr${i}`});
            await prismaClient.publishers.createMany({
                data
            });
            pubParams = {};

            req.setCookie("sessionId", Entities.session.session)
        });

        afterEach(async () => {
            await prismaClient.publishers.deleteMany();
            await clearUpSetup();
        });

        it("should return publisher with pagination", async () => {
            pubParams.page = 2;
            pubParams.pageSize = 7;

            const res = await executeSafely(() => req.get("?", pubParams));

            expect.soft(res!.status).toBe(200);
            const {data, info} = await res!.json();

            expect.soft(data.length).toBe(pubParams.pageSize);
            expect.soft(info.hasNextPage).toBeTruthy();
            expect.soft(info.itemsCount).toBe(totalPublishers);
        });

        it("should add new publisher when valid request is sent", async () => {
            const publisher = {
                publisherName: "hello publisher",
                address: "publisher address"
            };

            const res = await executeSafely(() => req.post("?", {
                ...publisher
            }));

            expect.soft(res!.status).toBe(200);
            const data = await prismaClient.publishers.findFirst({
                where: {
                    publisherName: publisher.publisherName
                }
            });

            expect.soft(data).toBeTruthy();
        });

        it("should update the given publisher in the database if valid data is sent", async () => {
            const updated = {
                publisherName: "hello publisher",
                address: "ktm"
            };

            const publisher = await prismaClient.publishers.create({
                data: {
                    publisherName: "testing genre",
                    address: "testing address"
                }
            });

            const res = await executeSafely(() => req.put(publisher.publisherId, updated));
            const tally = await prismaClient.publishers.findUnique({where: {publisherId: publisher.publisherId}});

            expect.soft(res!.status).toBe(200);
            expect.soft(tally).toMatchObject(updated);
        });

        it("should delete the publisher if valid id is sent", async () => {
            const publisher = await prismaClient.publishers.findFirst();
            const res = await executeSafely(() => req.delete(publisher!.publisherId));

            expect.soft(res!.status).toBe(200);
            const testData = await testPrisma.publishers.findUnique({
                where: {publisherId: publisher!.publisherId}
            });
            expect.soft(testData!.deletedAt).toBeTruthy();
        });
    });

    describe("Authors API", async () => {
        const totalAuthors = 38;

        const req = new FetchRequest(`http://localhost:${port}/api/attributes/authors`)
            .setDefaultHeaders();
        let authorParams
            :
            FilterParamsType;

        beforeEach(async () => {
            await initialSetup();

            await prismaClient.authors.deleteMany();
            const data = [];
            for (let i = 1; i <= totalAuthors; i++)
                data.push({fullName: `test${i}`});
            await prismaClient.authors.createMany({
                data
            });
            authorParams = {};

            req.setCookie("sessionId", Entities.session.session)
        });

        afterEach(async () => {
            await prismaClient.authors.deleteMany();
            await clearUpSetup();
        });

        it("should return authors with pagination", async () => {
            authorParams.page = 2;
            authorParams.pageSize = 7;

            const res = await executeSafely(() => req.get("?", authorParams));

            expect.soft(res!.status).toBe(200);

            const {data, info:{hasNextPage, itemsCount}} = await res!.json();

            expect.soft(data.length).toBe(authorParams.pageSize);
            expect.soft(hasNextPage).toBeTruthy();
            expect.soft(itemsCount).toBe(totalAuthors);
        });

        it("should add new authors when valid request is sent", async () => {
            const author = {
                title: "Mr",
                fullName: "Author FullName",
            };

            const res = await executeSafely(() => req.post("?", {
                ...author
            }));

            expect.soft(res!.status).toBe(200);
            const data = await prismaClient.authors.findFirst({
                where: {
                    fullName: author.fullName
                }
            });

            expect.soft(data).toBeTruthy();
        });

        it("should update the author in the database if update request is sent", async () => {
            const updated = {
                fullName: "hello genre",
                title: "Mr",
            };

            const author = await prismaClient.authors.create({
                data: {
                    fullName: "testing genre",
                    title: "Mr"
                }
            });

            const res = await executeSafely(() => req.put(author.authorId, updated));
            const tally = await prismaClient.authors.findUnique({where: {authorId: author.authorId}});

            expect.soft(res!.status).toBe(200);
            expect.soft(tally).toMatchObject(updated);
        });

        it("should delete the author if valid id is sent", async () => {
            const author = await prismaClient.authors.findFirst();
            const res = await executeSafely(() => req.delete(author!.authorId));

            expect.soft(res!.status).toBe(200);
            const testData = await testPrisma.authors.findUnique({
                where: {authorId: author!.authorId}
            });
            expect.soft(testData!.deletedAt).toBeTruthy();
        });
    });

});
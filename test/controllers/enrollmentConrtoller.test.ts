import {afterAll, afterEach, beforeAll, beforeEach, describe, expect, it} from "vitest";
import FetchRequest from "../FetchRequest";
import {clearUpSetup, Entities, executeSafely, initialSetup, port} from "../testUtils";
import prismaClient from "../../src/utils/prismaClient";
import {v7} from "uuid";
import {Sessions, Users} from "@prisma/client";
import {UserRoles} from "../../src/constants/enum";


describe("enrollments testings", async () => {
    const invalidEnrollmentsRequest = {
        "fullName": "Doruk Wagle",
        "dob": "2022/05/13",
        "address": "Kathmandu",
        "contactNo": "9829329243",
        "enrollmentYear": "2021",
        "gender": "Male",
        "roleId": "clyi4nvo20001n6essuyer3vp",
        "rollNumber": "98988823",
        "email": "doruk@gmail.com",
        "password": "password"
    };

    beforeEach(async () => {
        await initialSetup();
    });

    afterEach(async () => {
        await clearUpSetup();
    });

    describe("/api/enrollments", async () => {
        const req = new FetchRequest(`http://localhost:${port}/api/enrollments`)
            .setDefaultHeaders();
        let session: Sessions;
        let enrollment: Users;

        beforeEach(async () => {
            const expires = new Date();
            expires.setDate(expires.getDate() + 1);

             session = await prismaClient.sessions.create({
                data: {
                    session: v7(),
                    role: "Manager",
                    rolePrecedence: UserRoles.Manager,
                    expiresAt: expires,
                    userId: Entities.user.userId
                }
            });

             enrollment = await prismaClient.users.create({
                 data: {
                     ...invalidEnrollmentsRequest,
                     dob: new Date().toISOString(),
                     roleId: Entities.userRoles.roleId,
                     gender: "Male"
                 }
             });
        });

        afterEach(async () => {
           await prismaClient.sessions.deleteMany();
           await prismaClient.users.deleteMany();
        });

        it("should return 403 status if user don't have permission", async () => {
           await prismaClient.sessions.update({
               where: {
                   sessionId: session.sessionId,
               },
               data: {
                   ...session,
                   rolePrecedence: UserRoles.Member,
               }
           });

            const res = await executeSafely(() => req.setCookie("sessionId", session.session).get());

            expect.soft(res).toBeTruthy();
            expect.soft(res!.status).toBe(403);
        });

        it("should return the enrollments array if valid authorization", async () => {
            const res = await executeSafely(() => req.setCookie("sessionId", session.session).get());

            expect.soft(res).toBeTruthy();
            expect.soft(res!.status).toBe(200);

            const data = await res!.json();

            expect.soft(data[0]).toMatchObject({email: enrollment.email, userId: enrollment.userId});
        });

        it("should return empty array if the searched email doesn't exists", async () => {
            const res = await executeSafely(() =>
                req.setCookie("sessionId", session.session)
                    .get("?email=hello"));

            expect.soft(res).toBeTruthy();
            expect.soft(res!.status).toBe(200);

            const data = await res!.json();

            expect.soft(data).toMatchObject([]);
        });

        it("should return enrollment array if the searched email exists", async () => {
            const res = await executeSafely(() =>
                req.setCookie("sessionId", session.session)
                    .get("?email=doruk"));

            expect.soft(res).toBeTruthy();
            expect.soft(res!.status).toBe(200);

            const data = await res!.json();

            expect.soft(data[0]).toHaveProperty("email");

            expect.soft(data[0].email).toContain("doruk");
        });
    });

    describe("/api/enrollments/request", async () => {
        const req = new FetchRequest(`http://localhost:${port}/api/enrollments/request`)
            .setDefaultHeaders();

        it("should return 400 status if invalid data given", async () => {
            invalidEnrollmentsRequest.fullName = "hello";

            const res = await executeSafely<Promise<Response>>(() => req.post("", invalidEnrollmentsRequest));

            expect.soft(res).toBeTruthy();
            const data = await res!.json();

            expect.soft(res!.status).toBe(400);
            expect.soft(data).toHaveProperty("fullName");
        });

        it("should return 400 if invalid role is given", async () => {
            invalidEnrollmentsRequest.fullName = "Doruk Wagle";
            const res = await executeSafely<Promise<Response>>(() => req.post("", invalidEnrollmentsRequest));

            expect.soft(res).toBeTruthy();
            const data = await res!.json();

            expect.soft(res!.status).toBe(400);
            expect.soft(data).toHaveProperty("roleId");
        });

        it("should return 400 status if data already exists", async () => {
            invalidEnrollmentsRequest.email = Entities.user.email;
            invalidEnrollmentsRequest.roleId = Entities.userRoles.roleId;

            const res = await executeSafely<Promise<Response>>(() => req.post("", invalidEnrollmentsRequest));

            expect.soft(res).toBeTruthy();
            const data = await res!.json();

            expect.soft(res!.status).toBe(400);
            expect.soft(data).toHaveProperty("email");
        });

        it("should return 201 with requested data if valid data is sent", async () => {
            invalidEnrollmentsRequest.email = "doruk@gmail.com";
            invalidEnrollmentsRequest.roleId = Entities.userRoles.roleId;

            const res = await executeSafely<Promise<Response>>(() => req.post("", invalidEnrollmentsRequest));

            expect.soft(res).toBeTruthy();
            const data = await res!.json();

            expect.soft(res!.status).toBe(201);
            expect.soft(data).toMatchObject({email: invalidEnrollmentsRequest.email});
        });

        it("should store the given data in database if valid data is sent", async () => {
            // change email to avoid duplication
            invalidEnrollmentsRequest.email = "hello@gmail.com";
            invalidEnrollmentsRequest.rollNumber = "8893453";
            invalidEnrollmentsRequest.roleId = Entities.userRoles.roleId;

            const res = await executeSafely<Promise<Response>>(() => req.post("", invalidEnrollmentsRequest));
            expect.soft(res).toBeTruthy();
            expect.soft(res!.status).toBe(201);
            const data = await res!.json();
            expect.soft(data).toMatchObject({email: invalidEnrollmentsRequest.email});

            const find = await prismaClient.users.findUnique({
                where: {
                    email: invalidEnrollmentsRequest.email
                }
            });

            expect.soft(find).toBeTruthy();
            expect.soft(find!.email).toBe(invalidEnrollmentsRequest.email);
        });
    });

    // describe("/api/enrollments/approve/:id", async () => {
    //     const  req = new FetchRequest(`http://localhost:${port}/api/enrollments/approve`)
    //         .setDefaultHeaders();
    //
    //     it("should return 400 if user details is not given", async () => {
    //
    //     });
    //
    //     it("should return 400 if membership details is not given", () => {
    //
    //     });
    //
    //     // should return 400 if invalid membership type id is given
    //     // should return 201 if valid request is sent
    //     // should activate the user account
    //     // should assign the newly created membership
    // });
    //
    // describe("/api/enrollments/enroll", async () => {
    //     // should return 400 if invalid user details
    //     // should return 400 if invalid membership details
    //     // should create membership
    //     // should activate user account
    //     // should assign membership
    // });
});
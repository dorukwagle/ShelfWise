import {afterAll, beforeAll, describe, expect, it} from "vitest";
import FetchRequest from "../FetchRequest";
import {clearUpSetup, Entities, executeSafely, initialSetup, port} from "../testUtils";
import prismaClient from "../../src/utils/prismaClient";

describe("enrollment testings", async () => {
    const invalidEnrollmentRequest = {
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

    beforeAll(async () => {
        await initialSetup();
    });

    afterAll(async () => {
        await clearUpSetup();
    });

    describe("/api/enrollment/request", async () => {
        const  req = new FetchRequest(`http://localhost:${port}/api/enrollment/request`)
            .setDefaultHeaders();

        it("should return 400 status if invalid data given", async () => {
            invalidEnrollmentRequest.fullName = "hello";

            const res = await executeSafely<Promise<Response>>(() => req.post("", invalidEnrollmentRequest))

            expect(res).toBeTruthy();
            const data = await res!.json();

            expect(res!.status).toBe(400);
            expect(data).toHaveProperty("fullName");
        });

        it("should return 400 if invalid role is given", async () => {
            invalidEnrollmentRequest.fullName = "Doruk Wagle";
            const res = await executeSafely<Promise<Response>>(() => req.post("", invalidEnrollmentRequest));

            expect(res).toBeTruthy();
            const data = await res!.json();

            expect(res!.status).toBe(400);
            expect(data).toHaveProperty("roleId");
        });

        it("should return 400 status if data already exists", async () => {
            invalidEnrollmentRequest.email = Entities.user.email;
            invalidEnrollmentRequest.roleId = Entities.userRoles.roleId;

            const res = await executeSafely<Promise<Response>>(() => req.post("", invalidEnrollmentRequest));

            expect(res).toBeTruthy();
            const data = await res!.json();

            expect(res!.status).toBe(400);
            expect(data).toHaveProperty("email");
        });

        it("should return 201 with requested data if valid data is sent", async () => {
            invalidEnrollmentRequest.email = "doruk@gmail.com";

            const res = await executeSafely<Promise<Response>>(() => req.post("", invalidEnrollmentRequest));

            expect(res).toBeTruthy();
            const data = await res!.json();

            expect(res!.status).toBe(201);
            expect(data).toMatchObject({email: invalidEnrollmentRequest.email});
        });

        it("should store the given data in database if valid data is sent", async () => {
            // change email to avoid duplication
            invalidEnrollmentRequest.email = "hello@gmail.com";
            invalidEnrollmentRequest.rollNumber = "8893453";

            const res = await executeSafely<Promise<Response>>(() => req.post("", invalidEnrollmentRequest));
            expect(res).toBeTruthy();
            expect(res!.status).toBe(201);
            const data = await res!.json();
            expect(data).toMatchObject({email: invalidEnrollmentRequest.email});

            const find = await prismaClient.users.findUnique({
                where: {
                    email: invalidEnrollmentRequest.email
                }
            });

            expect(find).toBeTruthy();
            expect(find!.email).toBe(invalidEnrollmentRequest.email);
        });
    });

    // describe("/api/enrollment/approve/:id", async () => {
    //     // should return 400 if membership details is not given
    //     // should return 400 if invalid membership type id is given
    //     // should return 201 if valid request is sent
    //     // should activate the user account
    //     // should assign the newly created membership
    // });
    //
    // describe("/api/enrollment/enroll", async () => {
    //     // should return 400 if invalid user details
    //     // should return 400 if invalid membership details
    //     // should create membership
    //     // should activate user account
    //     // should assign membership
    // });
})
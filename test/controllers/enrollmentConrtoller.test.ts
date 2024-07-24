import {afterEach, beforeEach, describe, expect, it} from "vitest";
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

    const createSessionAndEnrollment = () => {
        const before = async () => {
            const expires = new Date();
            expires.setDate(expires.getDate() + 1);

            const session = await prismaClient.sessions.create({
                data: {
                    session: v7(),
                    role: "Manager",
                    rolePrecedence: UserRoles.Manager,
                    expiresAt: expires,
                    userId: Entities.user.userId
                }
            });

            const enrollment = await prismaClient.users.create({
                data: {
                    ...invalidEnrollmentsRequest,
                    dob: new Date().toISOString(),
                    roleId: Entities.userRoles.roleId,
                    gender: "Male"
                }
            });

            return {session, enrollment};
        };

        const after = async () => {
            await clearUpSetup();
        };

        return {before, after};
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
        let enrollment: Omit<Users, "password">;

        beforeEach(async () => {
            const sessionEnrollment = await createSessionAndEnrollment().before();
            session = sessionEnrollment.session;
            enrollment = sessionEnrollment.enrollment;
        });

        afterEach(async () => {
            await createSessionAndEnrollment().after();
        });

        it("should return 403 status if user don't have permission", async () => {
            await prismaClient.sessions.update({
                where: {
                    sessionId: session.sessionId
                },
                data: {
                    ...session,
                    rolePrecedence: UserRoles.Member
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

    describe("/api/enrollments/approve/:id", async () => {
        const req = new FetchRequest(`http://localhost:${port}/api/enrollments/approve`)
            .setDefaultHeaders();
        let session: Sessions;
        let enrollment: Omit<Users, "password">;
        let enrollmentInvalidData: any = {};

        beforeEach(async () => {
            const sessionEnrollment = await createSessionAndEnrollment().before();
            session = sessionEnrollment.session;
            enrollment = sessionEnrollment.enrollment;

            enrollmentInvalidData = {
                ...enrollment,
                "startDate": "2022-11-14",
                "expiryDate": "2023-11-14",
                "accountStatus": "Active",
                "membershipTypeId": v7()
            };
        });

        afterEach(async () => {
            await createSessionAndEnrollment().after();
        });

        it("should return 404 if the given enrollment id is not found", async () => {
            const res = await executeSafely(() =>
                req.setCookie("sessionId", session.session)
                    .post(enrollment.userId + "sdf"));

            expect.soft(res).toBeTruthy();
            const data = await res!.json();

            expect.soft(data).toHaveProperty("error");
        });

        it("should return 400 if user details is not given", async () => {
            const res = await executeSafely(() =>
                req.setCookie("sessionId", session.session)
                    .post(enrollment.userId));

            expect.soft(res).toBeTruthy();
            const data = await res!.json();

            expect.soft(res!.status).toBe(400);
            expect.soft(data).toHaveProperty("fullName");
        });

        it("should return 400 if membership details is not given", async () => {
            const res = await executeSafely(() =>
                req.setCookie("sessionId", session.session)
                    .post(enrollment.userId, {
                        ...enrollment
                    }));

            expect.soft(res).toBeTruthy();
            const data = await res!.json();

            expect.soft(res!.status).toBe(400);
            expect.soft(data).not.toHaveProperty("fullName");
            expect.soft(data).toHaveProperty("startDate");
        });

        it("should return 400 if invalid membership type id is given", async () => {
            const res = await executeSafely(() =>
                req.setCookie("sessionId", session.session)
                    .post(enrollment.userId, enrollmentInvalidData));

            expect.soft(res).toBeTruthy();
            const data = await res!.json();

            expect.soft(res!.status).toBe(400);
            expect.soft(data).toHaveProperty("membershipTypeId");
            expect.soft(data.membershipTypeId[0]).toContain("doesn't");
        });

        it("should return 200 if valid data is given", async () => {
            enrollmentInvalidData.membershipTypeId = Entities.membershipType.membershipTypeId;
            enrollmentInvalidData.email = enrollment.email;

            const res = await executeSafely(() =>
                req.setCookie("sessionId", session.session)
                    .post(enrollment.userId, enrollmentInvalidData));

            expect.soft(res).toBeTruthy();
            expect.soft(res!.status).toBe(200);
        });

        it("should create the new membership and assign it to the new user", async () => {
            enrollmentInvalidData.membershipTypeId = Entities.membershipType.membershipTypeId;
            enrollmentInvalidData.email = enrollment.email;

            // empty the membership database
            await prismaClient.memberships.deleteMany();

            const res = await executeSafely(() =>
                req.setCookie("sessionId", session.session)
                    .post(enrollment.userId, enrollmentInvalidData));

            const database = await prismaClient.memberships.findMany();

            expect.soft(res).toBeTruthy();
            const data = await res!.json();

            expect.soft(database?.length).toBeTruthy();

            expect.soft(database[0]).toMatchObject({
                startDate: new Date(enrollmentInvalidData.startDate),
                expiryDate: new Date(enrollmentInvalidData.expiryDate),
            });

            expect.soft(data.membership.membershipId).toBe(database[0].membershipId);
        });

        it("should update or change the enrollment info if given different value", async () => {
            enrollmentInvalidData.membershipTypeId = Entities.membershipType.membershipTypeId;
            enrollmentInvalidData.email = "helloemail@gmail.com";
            enrollmentInvalidData.fullName = "hello name";


            const res = await executeSafely(() =>
                req.setCookie("sessionId", session.session)
                    .post(enrollment.userId, enrollmentInvalidData));

            const user = await prismaClient.users.findUnique({
                where: {
                    userId: enrollment.userId
                }
            });

            expect.soft(res).toBeTruthy();
            expect.soft(user).toBeTruthy();

            expect.soft(user!.fullName).toBe(enrollmentInvalidData.fullName);
            expect.soft(user!.email).toBe(enrollmentInvalidData.email);
        });
    });

    describe("/api/enrollments/enroll", async () => {
        const req = new FetchRequest(`http://localhost:${port}/api/enrollments/enroll`)
            .setDefaultHeaders();
        let session: Sessions;
        let enrollment: Omit<Users, "password">;
        let enrollmentInvalidData: any = {};

        beforeEach(async () => {
            const sessionEnrollment = await createSessionAndEnrollment().before();
            session = sessionEnrollment.session;
            enrollment = sessionEnrollment.enrollment;

            enrollmentInvalidData = {
                ...enrollment,
                "expiryDate": "2023-11-14",
                "startDate": "2022-11-14",
                "accountStatus": "Active",
                "membershipTypeId": v7()
            };
        });

        afterEach(async () => {
            await createSessionAndEnrollment().after();
        });

        it("should return validation error if user details is not given", async () => {
            const res = await executeSafely(() =>
                req.setCookie("sessionId", session.session)
                    .post());

            expect.soft(res).toBeTruthy();
            const data = await res!.json();

            expect.soft(data).toHaveProperty("fullName");
        });

        it("should return validation error if membership details is not given", async () => {
            const res = await executeSafely(() =>
                req.setCookie("sessionId", session.session)
                    .post('', {
                        ...enrollment
                    }));

            expect.soft(res).toBeTruthy();
            const data = await res!.json();

            expect.soft(data).toHaveProperty("startDate");
            expect.soft(data).not.toHaveProperty("fullName");
        });

        it("should return email exists error if duplicate email is given", async () => {
            enrollmentInvalidData.email = Entities.user.email;

            const res = await executeSafely(() =>
                req.setCookie("sessionId", session.session)
                    .post('', {
                        ...enrollmentInvalidData
                    }));

            expect.soft(res).toBeTruthy();
            const data = await res!.json();

            expect.soft(data).toHaveProperty("email");
            expect.soft(data.email[0]).toContain("exist");
        });

        it("should enroll the user, and save in the database if valid input", async () => {
            await prismaClient.users.delete({
                where: {
                    email: enrollmentInvalidData.email
                }
            });

            const res = await executeSafely(() =>
                req.setCookie("sessionId", session.session)
                    .post('', {
                        ...enrollmentInvalidData,
                        membershipTypeId: Entities.membershipType.membershipTypeId
                    }));

            expect.soft(res).toBeTruthy();
            const data = await res!.json();

            const database = await prismaClient.users.findUnique({
                where: {
                    email: enrollmentInvalidData.email
                },
                include: {
                    membership: true
                }
            });
            expect.soft(database).toBeTruthy();
            expect.soft(data).toMatchObject(JSON.parse(JSON.stringify(database!)));
        });
    });
});
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const FetchRequest_1 = __importDefault(require("../FetchRequest"));
const testUtils_1 = require("../testUtils");
const prismaClient_1 = __importDefault(require("../../src/utils/prismaClient"));
const uuid_1 = require("uuid");
const enum_1 = require("../../src/constants/enum");
(0, vitest_1.describe)("enrollments testings", () => __awaiter(void 0, void 0, void 0, function* () {
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
        const before = () => __awaiter(void 0, void 0, void 0, function* () {
            const expires = new Date();
            expires.setDate(expires.getDate() + 1);
            const session = yield prismaClient_1.default.sessions.create({
                data: {
                    session: (0, uuid_1.v7)(),
                    role: "Manager",
                    rolePrecedence: enum_1.UserRoles.Manager,
                    expiresAt: expires,
                    userId: testUtils_1.Entities.user.userId
                }
            });
            const enrollment = yield prismaClient_1.default.users.create({
                data: Object.assign(Object.assign({}, invalidEnrollmentsRequest), { dob: new Date().toISOString(), roleId: testUtils_1.Entities.userRoles.roleId, gender: "Male" })
            });
            return { session, enrollment };
        });
        const after = () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, testUtils_1.clearUpSetup)();
        });
        return { before, after };
    };
    (0, vitest_1.beforeEach)(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, testUtils_1.initialSetup)();
    }));
    (0, vitest_1.afterEach)(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, testUtils_1.clearUpSetup)();
    }));
    (0, vitest_1.describe)("/api/enrollments", () => __awaiter(void 0, void 0, void 0, function* () {
        const req = new FetchRequest_1.default(`http://localhost:${testUtils_1.port}/api/enrollments`)
            .setDefaultHeaders();
        let session;
        let enrollment;
        (0, vitest_1.beforeEach)(() => __awaiter(void 0, void 0, void 0, function* () {
            const sessionEnrollment = yield createSessionAndEnrollment().before();
            session = sessionEnrollment.session;
            enrollment = sessionEnrollment.enrollment;
        }));
        (0, vitest_1.afterEach)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield createSessionAndEnrollment().after();
        }));
        (0, vitest_1.it)("should return 403 status if user don't have permission", () => __awaiter(void 0, void 0, void 0, function* () {
            yield prismaClient_1.default.sessions.update({
                where: {
                    sessionId: session.sessionId
                },
                data: Object.assign(Object.assign({}, session), { rolePrecedence: enum_1.UserRoles.Member })
            });
            const res = yield (0, testUtils_1.executeSafely)(() => req.setCookie("sessionId", session.session).get());
            vitest_1.expect.soft(res).toBeTruthy();
            vitest_1.expect.soft(res.status).toBe(403);
        }));
        (0, vitest_1.it)("should return the enrollments array if valid authorization", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, testUtils_1.executeSafely)(() => req.setCookie("sessionId", session.session).get());
            vitest_1.expect.soft(res).toBeTruthy();
            vitest_1.expect.soft(res.status).toBe(200);
            const data = yield res.json();
            vitest_1.expect.soft(data[0]).toMatchObject({ email: enrollment.email, userId: enrollment.userId });
        }));
        (0, vitest_1.it)("should return empty array if the searched email doesn't exists", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, testUtils_1.executeSafely)(() => req.setCookie("sessionId", session.session)
                .get("?email=hello"));
            vitest_1.expect.soft(res).toBeTruthy();
            vitest_1.expect.soft(res.status).toBe(200);
            const data = yield res.json();
            vitest_1.expect.soft(data).toMatchObject([]);
        }));
        (0, vitest_1.it)("should return enrollment array if the searched email exists", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, testUtils_1.executeSafely)(() => req.setCookie("sessionId", session.session)
                .get("?email=doruk"));
            vitest_1.expect.soft(res).toBeTruthy();
            vitest_1.expect.soft(res.status).toBe(200);
            const data = yield res.json();
            vitest_1.expect.soft(data[0]).toHaveProperty("email");
            vitest_1.expect.soft(data[0].email).toContain("doruk");
        }));
    }));
    (0, vitest_1.describe)("/api/enrollments/request", () => __awaiter(void 0, void 0, void 0, function* () {
        const req = new FetchRequest_1.default(`http://localhost:${testUtils_1.port}/api/enrollments/request`)
            .setDefaultHeaders();
        (0, vitest_1.it)("should return 400 status if invalid data given", () => __awaiter(void 0, void 0, void 0, function* () {
            invalidEnrollmentsRequest.fullName = "hello";
            const res = yield (0, testUtils_1.executeSafely)(() => req.post("", invalidEnrollmentsRequest));
            vitest_1.expect.soft(res).toBeTruthy();
            const data = yield res.json();
            vitest_1.expect.soft(res.status).toBe(400);
            vitest_1.expect.soft(data).toHaveProperty("fullName");
        }));
        (0, vitest_1.it)("should return 400 if invalid role is given", () => __awaiter(void 0, void 0, void 0, function* () {
            invalidEnrollmentsRequest.fullName = "Doruk Wagle";
            const res = yield (0, testUtils_1.executeSafely)(() => req.post("", invalidEnrollmentsRequest));
            vitest_1.expect.soft(res).toBeTruthy();
            const data = yield res.json();
            vitest_1.expect.soft(res.status).toBe(400);
            vitest_1.expect.soft(data).toHaveProperty("roleId");
        }));
        (0, vitest_1.it)("should return 400 status if data already exists", () => __awaiter(void 0, void 0, void 0, function* () {
            invalidEnrollmentsRequest.email = testUtils_1.Entities.user.email;
            invalidEnrollmentsRequest.roleId = testUtils_1.Entities.userRoles.roleId;
            const res = yield (0, testUtils_1.executeSafely)(() => req.post("", invalidEnrollmentsRequest));
            vitest_1.expect.soft(res).toBeTruthy();
            const data = yield res.json();
            vitest_1.expect.soft(res.status).toBe(400);
            vitest_1.expect.soft(data).toHaveProperty("email");
        }));
        (0, vitest_1.it)("should return 201 with requested data if valid data is sent", () => __awaiter(void 0, void 0, void 0, function* () {
            invalidEnrollmentsRequest.email = "doruk@gmail.com";
            invalidEnrollmentsRequest.roleId = testUtils_1.Entities.userRoles.roleId;
            const res = yield (0, testUtils_1.executeSafely)(() => req.post("", invalidEnrollmentsRequest));
            vitest_1.expect.soft(res).toBeTruthy();
            const data = yield res.json();
            vitest_1.expect.soft(res.status).toBe(201);
            vitest_1.expect.soft(data).toMatchObject({ email: invalidEnrollmentsRequest.email });
        }));
        (0, vitest_1.it)("should store the given data in database if valid data is sent", () => __awaiter(void 0, void 0, void 0, function* () {
            // change email to avoid duplication
            invalidEnrollmentsRequest.email = "hello@gmail.com";
            invalidEnrollmentsRequest.rollNumber = "8893453";
            invalidEnrollmentsRequest.roleId = testUtils_1.Entities.userRoles.roleId;
            const res = yield (0, testUtils_1.executeSafely)(() => req.post("", invalidEnrollmentsRequest));
            vitest_1.expect.soft(res).toBeTruthy();
            vitest_1.expect.soft(res.status).toBe(201);
            const data = yield res.json();
            vitest_1.expect.soft(data).toMatchObject({ email: invalidEnrollmentsRequest.email });
            const find = yield prismaClient_1.default.users.findUnique({
                where: {
                    email: invalidEnrollmentsRequest.email
                }
            });
            vitest_1.expect.soft(find).toBeTruthy();
            vitest_1.expect.soft(find.email).toBe(invalidEnrollmentsRequest.email);
        }));
    }));
    (0, vitest_1.describe)("/api/enrollments/approve/:id", () => __awaiter(void 0, void 0, void 0, function* () {
        const req = new FetchRequest_1.default(`http://localhost:${testUtils_1.port}/api/enrollments/approve`)
            .setDefaultHeaders();
        let session;
        let enrollment;
        let enrollmentInvalidData = {};
        (0, vitest_1.beforeEach)(() => __awaiter(void 0, void 0, void 0, function* () {
            const sessionEnrollment = yield createSessionAndEnrollment().before();
            session = sessionEnrollment.session;
            enrollment = sessionEnrollment.enrollment;
            enrollmentInvalidData = Object.assign(Object.assign({}, enrollment), { "startDate": "2022-11-14", "expiryDate": "2023-11-14", "accountStatus": "Active", "membershipTypeId": (0, uuid_1.v7)() });
        }));
        (0, vitest_1.afterEach)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield createSessionAndEnrollment().after();
        }));
        (0, vitest_1.it)("should return 404 if the given enrollment id is not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, testUtils_1.executeSafely)(() => req.setCookie("sessionId", session.session)
                .post(enrollment.userId + "sdf"));
            vitest_1.expect.soft(res).toBeTruthy();
            const data = yield res.json();
            vitest_1.expect.soft(data).toHaveProperty("error");
        }));
        (0, vitest_1.it)("should return 400 if user details is not given", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, testUtils_1.executeSafely)(() => req.setCookie("sessionId", session.session)
                .post(enrollment.userId));
            vitest_1.expect.soft(res).toBeTruthy();
            const data = yield res.json();
            vitest_1.expect.soft(res.status).toBe(400);
            vitest_1.expect.soft(data).toHaveProperty("fullName");
        }));
        (0, vitest_1.it)("should return 400 if membership details is not given", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, testUtils_1.executeSafely)(() => req.setCookie("sessionId", session.session)
                .post(enrollment.userId, Object.assign({}, enrollment)));
            vitest_1.expect.soft(res).toBeTruthy();
            const data = yield res.json();
            vitest_1.expect.soft(res.status).toBe(400);
            vitest_1.expect.soft(data).not.toHaveProperty("fullName");
            vitest_1.expect.soft(data).toHaveProperty("startDate");
        }));
        (0, vitest_1.it)("should return 400 if invalid membership type id is given", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, testUtils_1.executeSafely)(() => req.setCookie("sessionId", session.session)
                .post(enrollment.userId, enrollmentInvalidData));
            vitest_1.expect.soft(res).toBeTruthy();
            const data = yield res.json();
            vitest_1.expect.soft(res.status).toBe(400);
            vitest_1.expect.soft(data).toHaveProperty("membershipTypeId");
            vitest_1.expect.soft(data.membershipTypeId[0]).toContain("doesn't");
        }));
        (0, vitest_1.it)("should return 200 if valid data is given", () => __awaiter(void 0, void 0, void 0, function* () {
            enrollmentInvalidData.membershipTypeId = testUtils_1.Entities.membershipType.membershipTypeId;
            enrollmentInvalidData.email = enrollment.email;
            const res = yield (0, testUtils_1.executeSafely)(() => req.setCookie("sessionId", session.session)
                .post(enrollment.userId, enrollmentInvalidData));
            vitest_1.expect.soft(res).toBeTruthy();
            vitest_1.expect.soft(res.status).toBe(200);
        }));
        (0, vitest_1.it)("should create the new membership and assign it to the new user", () => __awaiter(void 0, void 0, void 0, function* () {
            enrollmentInvalidData.membershipTypeId = testUtils_1.Entities.membershipType.membershipTypeId;
            enrollmentInvalidData.email = enrollment.email;
            // empty the membership database
            yield prismaClient_1.default.memberships.deleteMany();
            const res = yield (0, testUtils_1.executeSafely)(() => req.setCookie("sessionId", session.session)
                .post(enrollment.userId, enrollmentInvalidData));
            const database = yield prismaClient_1.default.memberships.findMany();
            vitest_1.expect.soft(res).toBeTruthy();
            const data = yield res.json();
            vitest_1.expect.soft(database === null || database === void 0 ? void 0 : database.length).toBeTruthy();
            vitest_1.expect.soft(database[0]).toMatchObject({
                startDate: new Date(enrollmentInvalidData.startDate),
                expiryDate: new Date(enrollmentInvalidData.expiryDate),
            });
            vitest_1.expect.soft(data.membership.membershipId).toBe(database[0].membershipId);
        }));
        (0, vitest_1.it)("should update or change the enrollment info if given different value", () => __awaiter(void 0, void 0, void 0, function* () {
            enrollmentInvalidData.membershipTypeId = testUtils_1.Entities.membershipType.membershipTypeId;
            enrollmentInvalidData.email = "helloemail@gmail.com";
            enrollmentInvalidData.fullName = "hello name";
            const res = yield (0, testUtils_1.executeSafely)(() => req.setCookie("sessionId", session.session)
                .post(enrollment.userId, enrollmentInvalidData));
            const user = yield prismaClient_1.default.users.findUnique({
                where: {
                    userId: enrollment.userId
                }
            });
            vitest_1.expect.soft(res).toBeTruthy();
            vitest_1.expect.soft(user).toBeTruthy();
            vitest_1.expect.soft(user.fullName).toBe(enrollmentInvalidData.fullName);
            vitest_1.expect.soft(user.email).toBe(enrollmentInvalidData.email);
        }));
    }));
    (0, vitest_1.describe)("/api/enrollments/enroll", () => __awaiter(void 0, void 0, void 0, function* () {
        const req = new FetchRequest_1.default(`http://localhost:${testUtils_1.port}/api/enrollments/enroll`)
            .setDefaultHeaders();
        let session;
        let enrollment;
        let enrollmentInvalidData = {};
        (0, vitest_1.beforeEach)(() => __awaiter(void 0, void 0, void 0, function* () {
            const sessionEnrollment = yield createSessionAndEnrollment().before();
            session = sessionEnrollment.session;
            enrollment = sessionEnrollment.enrollment;
            enrollmentInvalidData = Object.assign(Object.assign({}, enrollment), { "expiryDate": "2023-11-14", "startDate": "2022-11-14", "accountStatus": "Active", "membershipTypeId": (0, uuid_1.v7)() });
        }));
        (0, vitest_1.afterEach)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield createSessionAndEnrollment().after();
        }));
        (0, vitest_1.it)("should return validation error if user details is not given", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, testUtils_1.executeSafely)(() => req.setCookie("sessionId", session.session)
                .post());
            vitest_1.expect.soft(res).toBeTruthy();
            const data = yield res.json();
            vitest_1.expect.soft(data).toHaveProperty("fullName");
        }));
        (0, vitest_1.it)("should return validation error if membership details is not given", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, testUtils_1.executeSafely)(() => req.setCookie("sessionId", session.session)
                .post('', Object.assign({}, enrollment)));
            vitest_1.expect.soft(res).toBeTruthy();
            const data = yield res.json();
            vitest_1.expect.soft(data).toHaveProperty("startDate");
            vitest_1.expect.soft(data).not.toHaveProperty("fullName");
        }));
        (0, vitest_1.it)("should return email exists error if duplicate email is given", () => __awaiter(void 0, void 0, void 0, function* () {
            enrollmentInvalidData.email = testUtils_1.Entities.user.email;
            const res = yield (0, testUtils_1.executeSafely)(() => req.setCookie("sessionId", session.session)
                .post('', Object.assign({}, enrollmentInvalidData)));
            vitest_1.expect.soft(res).toBeTruthy();
            const data = yield res.json();
            vitest_1.expect.soft(data).toHaveProperty("email");
            vitest_1.expect.soft(data.email[0]).toContain("exist");
        }));
        (0, vitest_1.it)("should enroll the user, and save in the database if valid input", () => __awaiter(void 0, void 0, void 0, function* () {
            yield prismaClient_1.default.users.delete({
                where: {
                    email: enrollmentInvalidData.email
                }
            });
            const res = yield (0, testUtils_1.executeSafely)(() => req.setCookie("sessionId", session.session)
                .post('', Object.assign(Object.assign({}, enrollmentInvalidData), { membershipTypeId: testUtils_1.Entities.membershipType.membershipTypeId })));
            vitest_1.expect.soft(res).toBeTruthy();
            const data = yield res.json();
            const database = yield prismaClient_1.default.users.findUnique({
                where: {
                    email: enrollmentInvalidData.email
                },
                include: {
                    membership: true
                }
            });
            vitest_1.expect.soft(database).toBeTruthy();
            vitest_1.expect.soft(data).toMatchObject(JSON.parse(JSON.stringify(database)));
        }));
    }));
}));

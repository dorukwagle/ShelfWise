import {afterAll, beforeAll, describe, expect, it} from "vitest";
import prismaClient from "../../src/utils/prismaClient";
import FetchRequest from "../FetchRequest";
import {clearUpSetup, Entities, executeSafely, initialSetup} from "../testUtils";


const prisma = prismaClient();

describe("AuthController testings...", async () => {
    const port:number = parseInt(process.env.PORT || "3000");
    const url: string = `http://localhost:${port}/api/auth/login`;
    const req = new FetchRequest(url)
        .setDefaultHeaders();
    const validCredential = {
        "email": "testing@gmail.com",
        "password": "manager123",
    };


    beforeAll(async () => {
        await initialSetup();
    });

    afterAll(async () => {
        await clearUpSetup();
    });

    describe("/api/login", async () => {
        it("should return 401 if email and password is not given", async () => {
            const res = await executeSafely<Promise<Response>>(() => req.post());

            expect(res).toBeTruthy();
            const data = await res!.json();

            expect.soft(res!.status).toBe(401);
            expect.soft(data.error).toContain("required");
        });

        it("should return 401 if invalid email is given", async () => {
            const res = await executeSafely<Promise<Response>>(() => req.post("", {
                "email": "invalid.email@gmail.com",
                "password": "haha123",
            }));

            expect(res).toBeTruthy();
            const data = await res!.json();

            expect.soft(res!.status).toBe(401);
            expect.soft(data.error).toContain("Incorrect");
        });

        it("should return 401 if incorrect password is given", async () => {
            const res = await executeSafely<Promise<Response>>(() => req.post("", {
                "email": "doruk.wagle@gmail.com",
                "password": "haha123",
            }));

            expect(res).toBeTruthy();
            const data = await res!.json();

            expect.soft(res!.status).toBe(401);
            expect.soft(data.error).toContain("Incorrect");
        });

        it("should return 200 with user info if correct email & password is given", async () => {
            const res = await executeSafely<Promise<Response>>(() => req.post("", validCredential));

            const data = await res!.json();

            expect.soft(res!.status).toBe(200);
            expect.soft(data).toMatchObject({gender: "Male", accountStatus: "Active", email: Entities.user.email});
        });

        it("should not include password in the user info after logged in", async () => {
            const res = await executeSafely<Promise<Response>>(() => req.post("", validCredential));

            const data = await res!.json();

            expect.soft(res!.status).toBe(200);
            expect.soft(data).not.toMatchObject({password: Entities.user.password});
        });

        it("should return sessionId and return it if correct email & password is given", async () => {
            await prisma.sessions.deleteMany();

            const res = await executeSafely<Promise<Response>>(() => req.post("", validCredential));
            const sessionData = await prisma.sessions.findFirst({
                where: { userId: Entities.user.userId },
            });

            expect(res).toBeTruthy();
            const session = res!.headers.getSetCookie()[0];

            expect.soft(res!.status).toBe(200);
            expect.soft(session).toContain("sessionId");
            expect.soft(session).toContain(sessionData?.session);
        });
    });
})
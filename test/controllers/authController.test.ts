import {afterAll, beforeAll, describe, expect, it} from "vitest";
import prismaClient from "../../src/utils/prismaClient";
import FetchRequest from "../FetchRequest";
import {clearUpSetup, Entities, executeSafely, initialSetup} from "../testUtils";
import {v7} from "uuid";


describe("AuthController testings...", async () => {
    const port:number = parseInt(process.env.PORT || "3000");
    const url: string = `http://localhost:${port}/api/auth`;
    const validCredential = {
        "email": "testing@gmail.com",
        "password": "manager123",
    };

    describe("/api/auth/login", async () => {
        beforeAll(async () => {
            await initialSetup();
        });

        afterAll(async () => {
            await clearUpSetup();
        });

        const  req = new FetchRequest(url + "/login")
            .setDefaultHeaders();

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
            await prismaClient.sessions.deleteMany();

            const res = await executeSafely<Promise<Response>>(() => req.post("", validCredential));
            const sessionData = await prismaClient.sessions.findFirst({
                where: { userId: Entities.user.userId },
            });

            expect(res).toBeTruthy();
            const session = res!.headers.getSetCookie()[0];

            expect.soft(res!.status).toBe(200);
            expect.soft(session).toContain("sessionId");
            expect.soft(session).toContain(sessionData?.session);
        });

        it("should return 401 if login attempted by accounts status not Active", async () => {
            // update account to have inactive status
            await prismaClient.users.update({
                where: {
                    userId: Entities.user.userId
                },
                data: {
                    accountStatus: "Pending"
                }
            });

            const res = await executeSafely<Promise<Response>>(() => req.post("", validCredential));

            expect(res).toBeTruthy();
            const data = await res!.json();

            expect.soft(res!.status).toBe(401);
            expect.soft(data.error).toContain("Incorrect");
        });
    });

    describe("/api/auth/logout", async () => {
        const req = new FetchRequest(url + "/logout")
            .setDefaultHeaders();

        beforeAll(async () => {
            await initialSetup();
        });

        afterAll(async () => {
            await clearUpSetup();
        });

        it("should return 401 status if not logged in", async () => {
            const res = await executeSafely<Promise<Response>>(() => req.delete());

            expect(res).toBeTruthy();
            const data = await res!.json();

            expect.soft(res!.status).toBe(401);
            expect.soft(data.error).toContain("login");
        });

        it("should return 200 if logged in and session should be deleted", async () => {
            const date = new Date();
            date.setDate(date.getDate() + 1);

            const sess = await prismaClient.sessions.create({
               data: {
                   userId: Entities.user.userId,
                   role: "Member",
                   rolePrecedence: 5,
                   session: v7(),
                   expiresAt: date
               }
            });

            const res = await req.setCookie("sessionId", sess.session).delete();

            expect(res).toBeTruthy();
            expect(res.status).toBe(200);

            const sessionCheck = await prismaClient.sessions.findFirst({
                where: { sessionId: sess.sessionId }
            });

            expect(sessionCheck).toBeFalsy();
        });
    });
});
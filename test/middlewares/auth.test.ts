import {afterAll, beforeAll, beforeEach, describe, expect, it} from "vitest";
import {clearUpSetup, createAuthorizationTestRoutes, Entities, initialSetup} from "../testUtils";
import prismaClient from "../../src/utils/prismaClient";
import {v7} from "uuid";
import {UserRoles} from "../../src/constants/enum";
import FetchRequest from "../FetchRequest";
import {Sessions} from "@prisma/client";


const prisma = prismaClient();

describe("authorization test", async () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const request = (url: string) => new FetchRequest(url).setDefaultHeaders();

    let session: Sessions;
    let sessionId: string;
    let partialUser = {};

    const updatePrecedence = (precedence: number) => prisma.sessions.update({
        where: {
            sessionId: session.sessionId
        },
        data: {
            ...session,
            rolePrecedence: precedence
        }
    });

    const updateSessionValidity = async (days: number) => {
        const date = new Date();
        date.setDate(date.getDate() +  days);

        await prisma.sessions.update({
            where: {
                sessionId: session.sessionId
            },
            data: {
                ...session,
                expiresAt: date
            }
        });
    };

    beforeAll(async () => {
        createAuthorizationTestRoutes();
        await initialSetup();
        session = await prisma
            .sessions.create({
                data: {
                    userId: Entities.user.userId,
                    session: v7(),
                    role: "Manager",
                    rolePrecedence: UserRoles.Manager,
                    expiresAt: date
                }
            });
        sessionId = session.session;
        partialUser = {
            userId: Entities.user.userId,
            email: Entities.user.email,
            fullName: Entities.user.fullName
        };
    });

    afterAll(async () => {
        await clearUpSetup();
    });

    /*
    * before some tests. session must be updated, to change role and precedence
    * */
    describe("basic authorization test", () => {
        const req = request("http://localhost:8080/auth");

        it("should return 401 if not authorized", async () => {
            const res = await req.get();

            expect.soft(res?.status).toBe(401);
            expect((await res.json()).error).toBeTruthy();
        });

        it("should return 401 if invalid session id", async () => {
            const res = await req.setCookie("sessionId", v7())
                .get();

            expect.soft(res?.status).toBe(401);
            expect.soft((await res.json()).error).toBeTruthy();
        });

        it("should return user info if valid session is given", async () => {
            const res = await req.setCookie("sessionId", sessionId)
                .get();

            expect.soft(res?.status).toBe(200);
            expect.soft((await res.json())).toMatchObject(partialUser);
        });

        it("should return 401 if expired session is given", async () => {
            await updateSessionValidity(-5); // decrease by 5 days. i.e. expire session

            const res = await req.setCookie("sessionId", sessionId)
                .get();

            expect.soft(res?.status).toBe(401);
            expect.soft((await res.json()).error).toBeTruthy();
        });

    });

    describe("member authorization test", async () => {
        const req = request("http://localhost:8080/member");

        beforeAll(async () => {
            await updateSessionValidity(2); // update validity by 2 days
        });

        beforeEach(async () => {
            req.setCookie('sessionId', session.session);
        });

        it("should return 401 if no session id is sent", async () => {
            req.setCookie('sessionId', '');
            const res = await req.get();

            expect.soft(res?.status).toBe(401);
            expect.soft((await res.json()).error).toBeTruthy();
        });

        it("should return data if accessed by member role", async () => {
            const res = await req.get();

            expect.soft(res?.status).toBe(200);
            expect.soft(await res.json()).toMatchObject(partialUser);
        });

        it("should return data if accessed by higher precedence role", async () => {
            await updatePrecedence(UserRoles.Coordinator);
            const res = await req.get();

            expect.soft(res?.status).toBe(200);
            expect.soft(await res.json()).toMatchObject(partialUser);
        });
    });

    describe("assistant manager authorization test", async () => {
        const req = request("http://localhost:8080/assistant");

        beforeAll(async () => {
            await updateSessionValidity(2);
        });

        beforeEach(async () => {
            req.setCookie('sessionId', session.session);
        });

        it("should return 401 if invalid session", async  () => {
            req.setCookie('sessionId', v7());
            const res = await req.get();

            expect.soft(res?.status).toBe(401);
            expect.soft((await res.json()).error).toBeTruthy();
        });

        it("should return 401 if session expired", async () => {
            await updateSessionValidity(-3);
            const res = await req.get();

            expect.soft(res?.status).toBe(401);
            expect.soft((await res.json()).error).toBeTruthy();
        });

        it("should return data if accessed by assistant manager", async () => {
            await updatePrecedence(UserRoles.AssistantManager);
            const res = await req.get();

            expect.soft(res?.status).toBe(200);
            expect.soft(await res.json()).toMatchObject(partialUser);
        });

        it("should return data if accessed by higher authority user", async () => {
            await updatePrecedence(UserRoles.Manager);
            const res = await req.get();

            expect.soft(res?.status).toBe(200);
            expect.soft(await res.json()).toMatchObject(partialUser);
        });

        it("should return 403 forbidden, if accessed by lower authority user", async () => {
            await updatePrecedence(UserRoles.Coordinator);
            const res = await req.get();

            expect.soft(res?.status).toBe(403);
            expect.soft((await res.json()).error).toBeTruthy();
        });
    })
});
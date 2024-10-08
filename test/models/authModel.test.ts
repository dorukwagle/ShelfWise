import {afterAll, beforeAll, describe, expect, it} from "vitest";
import {clearUpSetup, Entities, initialSetup} from "../testUtils";
import {createSession} from "../../src/api/auth/authModel";
import prismaClient from "../../src/utils/prismaClient";


describe("authModel -> createSession", () => {
    beforeAll(async () => {
        await initialSetup();
    });

    afterAll(async () => {
        await clearUpSetup();
    });

    it("should save the session to the database and return it", async () => {
        await prismaClient.sessions.deleteMany();

        const sessionReturned = await createSession(Entities.user);
        const expectedSession = await prismaClient.sessions.findFirst({
            where: {
                userId: Entities.user.userId
            }
        });

        expect.soft(expectedSession).toBeTruthy();
        expect.soft(sessionReturned).toBeTruthy();

        expect.soft(sessionReturned).toBe(expectedSession?.session);
    });
});
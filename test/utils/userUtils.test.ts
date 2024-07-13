import {afterAll, beforeAll, describe, expect, it} from "vitest";
import {clearUpSetup, Entities, initialSetup} from "../testUtils";
import getUserInfo from "../../src/utils/userUtils";


describe("userUtils", async () => {
    beforeAll(async () => {
        await initialSetup();
    });

    afterAll(async () => {
        await clearUpSetup();
    });

    it("should return user info with password if (id, true, true)", async () => {
        const result = await getUserInfo(Entities.user.userId, true);

        expect.soft(result).toMatchObject({password: Entities.user.password});
    });

    it("should not return password in the user info if (id, false, true)", async () => {
        const result = await getUserInfo(Entities.user.userId, false);

        expect.soft(result).not.toMatchObject({password: Entities.user.password});
    });

    it("should return membership and role details without password if (id, false, true)", async () => {
        const result = await getUserInfo(Entities.user.userId, false, true);

        expect.soft(result).not.toMatchObject({password: Entities.user.password});
        expect.soft(result).toMatchObject({membership: Entities.membership, role: Entities.userRoles});
    });

    it("should return user info with password without role and membership if (id, true, false)", async () => {
        const result = await getUserInfo(Entities.user.userId, true, false)

        expect.soft(result).toMatchObject({password: Entities.user.password});
        expect.soft(result).not.toMatchObject({membership: Entities.membership, role: Entities.userRoles});
    });
});
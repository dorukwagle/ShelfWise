import {afterAll, beforeAll, describe, expect, it, vi} from "vitest";
import {Server} from "node:http";
import app from "../../src/app";
import prismaClient from "../../src/utils/prismaClient";
import {hashPassword} from "../../src/utils/hash";
import {Users} from "@prisma/client";
import {UserRoles} from "../../src/constants/enum";
import FetchRequest from "../FetchRequest";



const prisma = prismaClient();

const executeSafely = async <T>(func: () => T) => {
    try {
        return  func();
    }
    catch (ex: any) {
        console.log(ex.message)
    }
}

describe("AuthController testings...", async () => {
    let server: Server;
    let user: Users;
    const port:number = parseInt(process.env.PORT || "3000");
    const url: string = `http://localhost:${port}/api/auth/login`;
    const req = new FetchRequest(url)
        .setDefaultHeaders();
    const validCredential = {
        "email": "testing@gmail.com",
        "password": "manager123",
    };


    const clearUpDb = async () => {
        await prisma.sessions.deleteMany();
        await prisma.users.deleteMany();
        await prisma.userRoles.deleteMany();
        await prisma.$disconnect();
    }

    beforeAll(async () => {
        vi.stubEnv('NODE_ENV', 'test');

        await clearUpDb();

        server = app.listen(port, "0.0.0.0");
        const managerRole = await prisma.userRoles.create(
            {
                data: {
                    role: "Manager",
                    precedence: UserRoles.Manager
                }
            }
        );

        user = await prisma.users.create({
            data: {
                fullName: "Doruk Wagle",
                email: "testing@gmail.com",
                dob: new Date("2001-03-03"),
                address: "Kathmandu Nepal",
                contactNo: "9829293466",
                gender: "Male",
                roleId: managerRole.roleId,
                rollNumber: "345435345",
                password: await hashPassword("manager123"),
                accountStatus: "Active",
                enrollmentYear: "2021",
            }
        });
    });

    afterAll(async () => {
        server.close();
        await clearUpDb();
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
            expect.soft(data).toMatchObject({gender: "Male", accountStatus: "Active", email: user.email});
        });

        it("should not include password in the user info after logged in", async () => {
            const res = await executeSafely<Promise<Response>>(() => req.post("", validCredential));

            const data = await res!.json();

            expect.soft(res!.status).toBe(200);
            expect.soft(data).not.toMatchObject({password: user.password});
        });

        it("should return sessionId and return it if correct email & password is given", async () => {
            const res = await executeSafely<Promise<Response>>(() => req.post("", validCredential));

            const sessionData = await prisma.sessions.findFirst({
                where: { userId: user.userId },
            });

            expect(res).toBeTruthy();

            const session = res!.headers.getSetCookie()[0];

            expect.soft(res!.status).toBe(200);
            expect.soft(session).toContain("sessionId");
            expect.soft(sessionData?.session).toBe(session.split('=')[1]);
        });

    });
})
import {Request, Response, NextFunction} from "express";
import {PrismaClient, Sessions} from "@prisma/client";
import {Session} from "node:inspector";
import SessionRequest from "../entities/sessionRequest";
import {UserRoles} from "../constants/enum";


const prisma = new PrismaClient();

const msg: {[key: string]: string} = {
    401: "please login first",
    403: "permission denied: you are not allowed here",
}

const getSession = async(req: Request) => {
    const sessionCookie: string = req.cookies.sessionId;
    if (!sessionCookie) return null;

    return prisma.sessions.findFirst({
        where: {
            AND: [
                {
                    session: sessionCookie
                },
                {
                    expiresAt: { gte: new Date()}
                }
            ]
        }
    });
}

const authorize = async (req: SessionRequest, res: Response, next: NextFunction) => {
    const session = await getSession(req);
    // console.log(session);
    if (!session) return res.status(401).send(msg[401]);
    req.session = session;
    next();
}

const authGeneric = async (req: SessionRequest, res: Response, next: NextFunction, rolePrecedence: number) => {
    const session = await getSession(req);
    if (!req.session) return session;
    if (req.session.rolePrecedence < rolePrecedence) return res.status(403).send(msg[403]);

    next();
}

const memberAuth = async (req: SessionRequest, res: Response, next: NextFunction) =>
    await authGeneric(req, res, next, UserRoles.Member);


const coordinatorAuth = async (req: SessionRequest, res: Response, next: NextFunction) =>
    await authGeneric(req, res, next, UserRoles.Coordinator);

const assistantManagerAuth = async (req: SessionRequest, res: Response, next: NextFunction) =>
    await authGeneric(req, res, next, UserRoles.AssistantManager);

const managerAuth = async (req: SessionRequest, res: Response, next: NextFunction) =>
    await authGeneric(req, res, next, UserRoles.Manager);

export {
    authorize,
    memberAuth,
    coordinatorAuth,
    assistantManagerAuth,
    managerAuth
};
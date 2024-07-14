import {Request, Response, NextFunction} from "express";
import SessionRequest from "../entities/sessionRequest";
import {UserRoles} from "../constants/enum";
import prismaClient from "../utils/prismaClient";


const prisma = prismaClient();

const msg: {[key: string]: {error:string}} = {
    401: {error: "please login first"},
    403: {error: "permission denied: you are not allowed here"}
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



const authGeneral = async (req: SessionRequest, res: Response) => {
    const session = await getSession(req);
    if (!session) return res.status(401).json(msg[401]);
    req.session = session;
}

const authorize = async (req: SessionRequest, res: Response, next: NextFunction) => {
    const auth = await authGeneral(req, res);
    if (!req.session) return auth;
    next();
}

const validateAuthority = async (req: SessionRequest, res: Response, next: NextFunction, rolePrecedence: number) => {
    const auth = await authGeneral(req, res);
    if (!req.session) return auth;
    if (req.session.rolePrecedence < rolePrecedence) return res.status(403).json(msg[403]);
    next();
}

const memberAuth = async (req: SessionRequest, res: Response, next: NextFunction) =>
    await validateAuthority(req, res, next, UserRoles.Member);


const coordinatorAuth = async (req: SessionRequest, res: Response, next: NextFunction) =>
    await validateAuthority(req, res, next, UserRoles.Coordinator);

const assistantManagerAuth = async (req: SessionRequest, res: Response, next: NextFunction) =>
    await validateAuthority(req, res, next, UserRoles.AssistantManager);

const managerAuth = async (req: SessionRequest, res: Response, next: NextFunction) =>
    await validateAuthority(req, res, next, UserRoles.Manager);

export {
    authorize,
    memberAuth,
    coordinatorAuth,
    assistantManagerAuth,
    managerAuth
};
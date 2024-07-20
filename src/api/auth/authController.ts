import express from "express";
import {authenticate, createSession} from "./authModel";
import {Users} from "@prisma/client";
import SessionRequest from "../../entities/sessionRequest";
import {authorize} from "../../middlewares/auth";
import prismaClient from "../../utils/prismaClient";


const auth = express.Router();

interface Credentials {
    email: string;
    password: string;
}

auth.post("/login", async (req: express.Request<{}, any, Credentials>, res) => {
    const {email, password} = req.body;

    if (!email || !password) return res.status(401).json({error: "email and password required"});

    const user = await authenticate(email, password);
    if (!user) return res.status(401).json({error: "Incorrect email or password"});

    const isProd = process.env.NODE_ENV === "production";

    const session = await createSession(user as Users);
    res.cookie("sessionId", session, {
        httpOnly: true,
        sameSite: isProd,
        secure: isProd,
        maxAge: 60 * 60 * 24 * 6 * 1000, // 6 days
    });

    res.status(200).json(user);
});

auth.delete("/logout", authorize, async (req: SessionRequest, res) => {
    await prismaClient.sessions.delete({
        where: {
            sessionId: req.session?.sessionId
        }
    });

    res.status(200).end();
})


export default auth;
import express from "express";
import {authenticate, createSession} from "./authModel";


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

    const sessions = await createSession(user);
    res.cookie("sessionId", JSON.stringify(sessions), {
        httpOnly: true,
        sameSite: isProd,
        secure: isProd,
        maxAge: 60 * 60 * 24 * 6 * 1000, // 6 days
    });

    return res.status(200).json(user);
});


export default auth;
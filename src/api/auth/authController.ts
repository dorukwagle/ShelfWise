import express from "express";
import {authenticate} from "./authModel";


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

    return res.status(200).json(user);
})

export default auth;
import router from "express";
import express from "express";
import {getMyInfo} from "./meModel";

const me = express.Router();

me.get("/", async (req, res) => {
    return res.status(200).json(await getMyInfo("45"));
});

export default me;
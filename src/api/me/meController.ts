import router from "express";
import express from "express";
import {getMyInfo} from "./meModel";
import SessionRequest from "../../entities/sessionRequest";

const me = express.Router();

me.get("/", async (req: SessionRequest, res) => {
    return res.status(200).json(await getMyInfo(req.session!.userId));
});

export default me;
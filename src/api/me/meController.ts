import router from "express";
import express from "express";
import {getMyInfo} from "./meModel";

const me = express.Router();

me.get("/me", async (req, res) => {
    return res.status(200).json(getMyInfo("45"));
});

export default me;
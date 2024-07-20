import express from "express";
import {assistantManagerAuth} from "../../middlewares/auth";

const enrollment = express.Router();

enrollment.post("/request", async (req, res) => {

});

enrollment.post("/enroll", assistantManagerAuth, async (req, res) => {

});

export default enrollment;
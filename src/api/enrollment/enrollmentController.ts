import express from "express";
import {assistantManagerAuth} from "../../middlewares/auth";
import enrollmentRequest from "../../validations/EnrollmentRequest";
import prismaClient from "../../utils/prismaClient";
import createEnrollmentRequest from "./enrollmentModel";

const enrollment = express.Router();

enrollment.post("/request", async (req, res) => {
    const validation =
        await enrollmentRequest.safeParseAsync(req.body);
    if (validation.error) return res.status(400).send(validation.error.formErrors.fieldErrors);

    const created = await createEnrollmentRequest(validation.data);

    res.status(201).json(created);
});

enrollment.post("/enroll", assistantManagerAuth, async (req, res) => {

});

export default enrollment;
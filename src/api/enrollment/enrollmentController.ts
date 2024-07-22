import express, {Response} from "express";
import {assistantManagerAuth} from "../../middlewares/auth";
import enrollmentRequest from "../../validations/EnrollmentRequest";
import prismaClient from "../../utils/prismaClient";
import {createEnrollmentRequest, getEnrollments} from "./enrollmentModel";
import SessionRequest from "../../entities/sessionRequest";

const enrollment = express.Router();

const invalidResponse = (validation: any, res: Response) => {
    if (Object.keys(validation.error?.formErrors?.fieldErrors || {}).length)
        return res.status(400).json(validation.error?.formErrors.fieldErrors);
    if (validation.error) return res.status(400).json(validation.error);

    return null;
}

enrollment.get("/", assistantManagerAuth, async (req: SessionRequest<{}, any, any, {email: string | undefined}>, res) => {
    const filterEmail = req.query.email;
    res.status(200).json(await getEnrollments(filterEmail));
});

enrollment.post("/request", async (req, res) => {
    const validation =
        await enrollmentRequest.safeParseAsync(req.body);

    const response = invalidResponse(validation, res);
    if (response) return response;

    const created = await createEnrollmentRequest(validation.data!);

    res.status(201).json(created);
});

enrollment.post("/approve/", assistantManagerAuth, async (req, res) => {
    res.json({"message": "approved", "userId": req.body.userId});
});

export default enrollment;
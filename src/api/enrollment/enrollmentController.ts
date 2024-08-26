import express from "express";
import {assistantManagerAuth} from "../../middlewares/auth";
import {approveEnrollment, createEnrollmentRequest, enrollUser, getEnrollments} from "./enrollmentModel";
import SessionRequest from "../../entities/SessionRequest";


const enrollment = express.Router();

enrollment.get("/", assistantManagerAuth,
    async (req: SessionRequest<{}, any, any, { email: string | undefined }>, res) => {
        const filterEmail = req.query.email;
        res.status(200).json(await getEnrollments(filterEmail));
    });

enrollment.post("/request", async (req, res) => {
    const {statusCode, data, error} = await createEnrollmentRequest(req.body);
    return res.status(statusCode).json(error ? error : data);
});

enrollment.post("/approve/:userId", assistantManagerAuth, async (req: SessionRequest<{ userId: string }>, res) => {
const {statusCode, data, error} = await approveEnrollment(req.params.userId, req.body);
    return res.status(statusCode).json(error ? error : data);
});

enrollment.post("/enroll", assistantManagerAuth, async (req, res) => {
    const {statusCode, data, error} = await enrollUser(req.body);
    return res.status(statusCode).json(error ? error : data);
});

export default enrollment;
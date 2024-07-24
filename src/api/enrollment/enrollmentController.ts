import express from "express";
import {assistantManagerAuth} from "../../middlewares/auth";
import {approveEnrollment, createEnrollmentRequest, enrollUser, getEnrollments} from "./enrollmentModel";
import SessionRequest from "../../entities/sessionRequest";


const enrollment = express.Router();

enrollment.get("/", assistantManagerAuth,
    async (req: SessionRequest<{}, any, any, { email: string | undefined }>, res) => {
        const filterEmail = req.query.email;
        res.status(200).json(await getEnrollments(filterEmail));
    });

enrollment.post("/request", async (req, res) => {
    const created = await createEnrollmentRequest(req.body);
    if (created.error) return res.status(created.statusCode).json(created.error);

    res.status(201).json(created.data);
});

enrollment.post("/approve/:userId", assistantManagerAuth, async (req: SessionRequest<{ userId: string }>, res) => {
    const user = await approveEnrollment(req.params.userId, req.body);
    if (user.error) return res.status(user.statusCode).json(user.error);

    res.json(user.data);
});

enrollment.post("/enroll", assistantManagerAuth, async (req, res) => {
    const user = await enrollUser(req.body);
    if (user.error) return res.status(user.statusCode).json(user.error);

    res.json(user.data);
});

export default enrollment;
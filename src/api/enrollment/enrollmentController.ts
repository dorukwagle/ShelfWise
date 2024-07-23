import express, {Response} from "express";
import {assistantManagerAuth} from "../../middlewares/auth";
import EnrollmentRequest from "../../validations/EnrollmentRequest";
import prismaClient from "../../utils/prismaClient";
import {createEnrollmentRequest, getEnrollments} from "./enrollmentModel";
import SessionRequest from "../../entities/sessionRequest";
import Enrollment, {EnrollmentType} from "../../validations/Enrollment";

const enrollment = express.Router();

const invalidResponse = (validation: any, res: Response) => {
    if (Object.keys(validation.error?.formErrors?.fieldErrors || {}).length)
        return res.status(400).json(validation.error?.formErrors.fieldErrors);
    if (validation.error) return res.status(400).json(validation.error);

    return null;
};

enrollment.get("/", assistantManagerAuth, async (req: SessionRequest<{}, any, any, {
    email: string | undefined
}>, res) => {
    const filterEmail = req.query.email;
    res.status(200).json(await getEnrollments(filterEmail));
});

enrollment.post("/request", async (req, res) => {
    const validation =
        await EnrollmentRequest.safeParseAsync(req.body);

    const response = invalidResponse(validation, res);
    if (response) return response;

    const created = await createEnrollmentRequest(validation.data!);

    res.status(201).json(created);
});

enrollment.post("/approve/:userId", assistantManagerAuth, async (req: SessionRequest<{userId: string}>, res) => {
    const userId = req.params.userId;

    const userExist = await prismaClient.users.findUnique({
        where: {userId}
    });

    if (!userExist) return res.status(404).json({error: "Enrollment does not exist"});

    const validation = await Enrollment(userId).safeParseAsync(req.body);
    const response = invalidResponse(validation, res);
    if (response) return response;

    const {startDate,
        expiryDate,
        membershipTypeId,
        accountStatus
    } = validation.data!;

    const membership = await prismaClient.memberships.create({
        data: {
            startDate,
            expiryDate,
            membershipTypeId
        }
    });

    const userInfo = await EnrollmentRequest.safeParseAsync(req.body);

    const user = await prismaClient.users.update({
        where: {userId},
        data: {
            ...userInfo.data!,
            accountStatus: accountStatus,
            membershipId: membership.membershipId
        },
        include: {
            membership: true
        }
    });

    res.json(user);
});

export default enrollment;
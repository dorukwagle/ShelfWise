import { z } from "zod";
import enrollmentRequest from "./EnrollmentRequest";
import prismaClient from "../utils/prismaClient";
import EnrollmentRequest from "./EnrollmentRequest";


const membershipTypeExists = async (membershipTypeId: string) => {
    const membership = await prismaClient.membershipTypes.findUnique({
        where: {
            membershipTypeId
        }
    });

    return !!membership;
}

const Enrollment = enrollmentRequest.extend({
    accountStatus: z.enum(["Pending", "Active", "Inactive", "Rejected", "Suspended"],
        {required_error: "Account Status is required"}),
    startDate: z.string({required_error: "Membership Start Date is required"}).date(),
    expiryDate: z.string({required_error: "Membership Expiry Date is required"}).date(),
    membershipTypeId: z.string({required_error: "Membership Type is required"})
        .refine(membershipTypeExists, "Membership Type doesn't exist"),
});

export type EnrollmentType = z.infer<typeof EnrollmentRequest>;

export default Enrollment;
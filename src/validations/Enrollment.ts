import { z } from "zod";
import enrollmentRequest from "./EnrollmentRequest";
import prismaClient from "../utils/prismaClient";
import EnrollmentRequest from "./EnrollmentRequest";
import {exists} from "../utils/dbValidation";

let currentUserId = "";

const membershipTypeExists = async (membershipTypeId: string) =>
    exists("MembershipTypes", "membershipTypeId", membershipTypeId);

const uniqueEmail = async (email: string) => {
    const user = await prismaClient.users.findFirst({
        where: {
            email: email,
            NOT: {userId: currentUserId}
        }
    });

    return !user;
};

const EnrollmentSchema = enrollmentRequest.omit({email: true}).extend({
    accountStatus: z.enum(["Pending", "Active", "Inactive", "Rejected", "Suspended"],
        {required_error: "Account Status is required"}),
    startDate: z.coerce.date({required_error: "Membership Start Date is required"}),
    expiryDate: z.coerce.date({required_error: "Membership Expiry Date is required"}),
    membershipTypeId: z.string({required_error: "Membership Type is required"})
        .refine(membershipTypeExists, "Membership Type doesn't exist"),
    email: z.string({required_error: "Email is required"})
        .email()
        .refine(uniqueEmail, "Email already exists"),
});

export type EnrollmentType = Required<z.infer<typeof EnrollmentSchema>>;

const Enrollment = (userId: string) => {
    currentUserId = userId;
    return EnrollmentSchema
};

export default Enrollment;
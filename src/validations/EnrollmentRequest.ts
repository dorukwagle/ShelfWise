import { z } from "zod";
import prismaClient from "../utils/prismaClient";
import {exists, unique} from "../utils/dbValidation";


const roleExists = async (roleId: string) => exists("userRoles", "roleId", roleId);

const uniqueEmail = async (email: string) => unique("users", "email", email);

const EnrollmentRequest = z.object({
    fullName: z.string({required_error: "Full Name is required"})
        .refine(val => val.split(" ").length >= 2, "Please enter your full name"),
    dob: z.coerce.date(),
    address: z.string({required_error: "Address is required"}),
    contactNo: z.string({required_error: "Contact No. is required"}),
    enrollmentYear: z.string({required_error: "Enrollment Year is required"}),
    gender: z.enum(["Male", "Female", "Others"], {required_error: "Gender is required"}),
    roleId: z.string({required_error: "Role is required"})
        .refine(roleExists, "User Role not found"),
    rollNumber: z.string({required_error: "Roll Number is required"}),
    email: z.string().email().refine(uniqueEmail, "Email already exists"),
    password: z.string({required_error: "Password is required"})
        .min(8, "Password must be at least 8 characters long"),
});

export type EnrollmentRequestType = z.infer<typeof EnrollmentRequest>;

export default EnrollmentRequest;
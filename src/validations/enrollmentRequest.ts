import { z } from "zod";
import prismaClient from "../utils/prismaClient";


const roleExists = async (roleId: string) => {
    const role = await prismaClient.userRoles.findUnique({
        where: {
            roleId: roleId
        }
    });

    return !!role;
}

const uniqueEmail = async (email: string) => {
    const user = await prismaClient.users.findUnique({
       where: {
           email: email
       }
    });

    return !user;
};

const EnrollmentRequest = z.object({
    fullName: z.string({required_error: "Full Name is required"})
        .refine(val => val.split(" ").length >= 2, "Please enter your full name"),
    dob: z.string({required_error: "DOB is required"}).date(),
    address: z.string({required_error: "Address is required"}),
    contactNo: z.string({required_error: "Contact No. is required"}),
    enrollmentYear: z.string({required_error: "Enrollment Year is required"}).date("YYYY"),
    gender: z.enum(["Male", "Female", "Others"], {required_error: "Gender is required"}),
    roleId: z.string({required_error: "Role is required"})
        .refine(roleExists, "User Role not found"),
    rollNumber: z.string({required_error: "Roll Number is required"}),
    email: z.string().email().refine(uniqueEmail, "Email already exists"),
    password: z.string({required_error: "Password is required"})
        .min(8, "Password must be at least 8 characters long"),
});

export default EnrollmentRequest;
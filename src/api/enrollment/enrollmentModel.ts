import prismaClient from "../../utils/prismaClient";
import {EnrollmentRequestType} from "../../validations/EnrollmentRequest";
import {hashPassword} from "../../utils/hash";


const createEnrollmentRequest = async (validatedData: EnrollmentRequestType) => {
    validatedData.password = await hashPassword(validatedData.password);

    return prismaClient.users.create({
        data: {
            ...validatedData
        },
        omit: {
            password: true
        }
    });
}

export default createEnrollmentRequest;
import prismaClient from "../../utils/prismaClient";
import EnrollmentRequest, {EnrollmentRequestType} from "../../validations/EnrollmentRequest";
import {hashPassword} from "../../utils/hash";
import {Users} from "@prisma/client";
import Enrollment, {EnrollmentType} from "../../validations/Enrollment";


interface ModelReturnTypes<D = {}, E = {}> {
    error: E;
    statusCode: number;
    data: D;
}


const invalidResponse = <D = {}, E = {}>(validation: any) => {
    const res = {} as ModelReturnTypes<D, E>;
    res.statusCode = 400;

    if (Object.keys(validation.error?.formErrors?.fieldErrors || {}).length)
        res.error = validation.error?.formErrors.fieldErrors;
    else if (validation.error)
        res.error = validation.error;

    return res.error ? res : null;
};

const validateApproveEnrollmentRequest = async (userId: string, data: EnrollmentType) => {
    const res = {} as ModelReturnTypes<EnrollmentType>;
    res.statusCode = 404;

    const userExist = await prismaClient.users.findUnique({
        where: {userId}
    });

    if (!userExist) {
        res.error = {error: "Enrollment does not exist"};
        return res;
    }

    const validation = await Enrollment(userId).safeParseAsync(data);
    const response = invalidResponse<EnrollmentType>(validation);

    if (response) return response;

    res.data = validation.data!;
    return res;
};

const createEnrollmentRequest = async (data: EnrollmentRequestType) => {
    const res = {} as ModelReturnTypes<Omit<Users, "password">, any>;

    const validation =
        await EnrollmentRequest.safeParseAsync(data);

    const response = invalidResponse<Users, any>(validation);
    if (response) return response;

    const validatedData = validation.data!;

    validatedData.password = await hashPassword(validatedData.password);

    res.data = await prismaClient.users.create({
        data: {
            ...validatedData
        },
        omit: {
            password: true
        }
    });

    return res;
};

const getEnrollments = async (emailFilter: string = "") => {
    const emailSelect = {};
    return prismaClient.users.findMany({
        where: {
            accountStatus: "Pending",
            email: emailFilter ? ({
                contains: emailFilter
            }) : undefined
        },
        orderBy: {
            createdAt: "asc"
        }
    });
};

const approveEnrollment = async (userId: string, data: EnrollmentType) => {
    const validation = await validateApproveEnrollmentRequest(userId, data);
    if (validation.error) return validation;

    const userInfo = await EnrollmentRequest.safeParseAsync(validation.data);
    const {
        accountStatus,
        startDate,
        expiryDate,
        membershipTypeId
    } = validation.data!;

    const user = await prismaClient.users.update({
        where: {userId},
        data: {
            ...userInfo.data!,
            accountStatus: accountStatus,
            membership: {
                create: {
                    startDate,
                    expiryDate,
                    membershipTypeId
                }
            }
        },
        include: {
            membership: true
        },
        omit: {
            password: true
        }
    });

    return {data: user} as ModelReturnTypes<typeof user>;
};

const enrollUser = async (data: EnrollmentType) => {
    const validation = await Enrollment("").safeParseAsync(data);

    const response = invalidResponse(validation);
    if (response) return response;

    const userInfo = await EnrollmentRequest.safeParseAsync(validation.data);
    const {
        accountStatus,
        membershipTypeId,
        startDate,
        expiryDate,
    } = validation.data!;

    const user = await prismaClient.users.create({
        data: {
            ...userInfo.data!,
            accountStatus,
            membership: {
                create: {
                    membershipTypeId,
                    startDate,
                    expiryDate
                }
            }
        },
        include: {
            membership: true
        },
        omit: {
            password: true
        }
    });

    return {data: user} as ModelReturnTypes<typeof user>;
};

export {
    createEnrollmentRequest,
    getEnrollments,
    approveEnrollment,
    enrollUser
};
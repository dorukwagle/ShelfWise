import prismaClient from "../../utils/prismaClient";
import EnrollmentRequest, {EnrollmentRequestType} from "../../validations/EnrollmentRequest";
import {hashPassword} from "../../utils/hash";
import {Users} from "@prisma/client";
import Enrollment, {EnrollmentType} from "../../validations/Enrollment";
import ModelReturnTypes from "../../entities/ModelReturnTypes";
import formatValidationErrors from "../../utils/formatValidationErrors";

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
    const response = formatValidationErrors<EnrollmentType>(validation);
    if (response) return response;

    res.data = validation.data!;
    return res;
};

const createEnrollmentRequest = async (data: EnrollmentRequestType) => {
    const res = {statusCode: 201} as ModelReturnTypes<Omit<Users, "password">, any>;

    const validation =
        await EnrollmentRequest.safeParseAsync(data);

    const response = formatValidationErrors<Users, any>(validation);
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
    return prismaClient.users.findMany({
        where: {
            accountStatus: "Pending",
            email: emailFilter ? ({
                contains: emailFilter
            }) : undefined
        },
        orderBy: {
            createdAt: "asc"
        },
        omit: {
            password: true
        }
    });
};

const approveEnrollment = async (userId: string, data: EnrollmentType) =>  {
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

    return {data: user, statusCode: 200} as ModelReturnTypes<typeof user>;
};

const enrollUser = async (data: EnrollmentType) => {
    const validation = await Enrollment("").safeParseAsync(data);

    const response = formatValidationErrors(validation);
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
        }
    });

    return {data: user, statusCode: 201} as ModelReturnTypes<typeof user>;
};

export {
    createEnrollmentRequest,
    getEnrollments,
    approveEnrollment,
    enrollUser
};
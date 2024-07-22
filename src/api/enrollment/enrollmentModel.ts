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

const getEnrollments = async (emailFilter: string = '') => {
    const emailSelect = {}
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

export {
    createEnrollmentRequest,
    getEnrollments,
};
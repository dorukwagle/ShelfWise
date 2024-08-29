import {hashPassword} from "../src/utils/hash";
import {UserRoles} from "../src/constants/enum";
import prismaClient from "../src/utils/prismaClient";

async function main() {
    // seed the user roles table
    const managerRole = await prismaClient.userRoles.create(
        {
            data: {
                role: "Manager",
                precedence: UserRoles.Manager
            }
        }
    );

    await prismaClient.userRoles.createMany({
        data: [
            {
                role: "AssistantManager",
                precedence: UserRoles.AssistantManager
            },{
                role: "Coordinator",
                precedence: UserRoles.Coordinator
            },{
                role: "Member",
                precedence: UserRoles.Member
            }
        ]
    });

    // seed the membership table
    const employeeType = await prismaClient.membershipTypes.create({
        data: {
            type: "Employee",
            precedence: 1
        }
    });

    await prismaClient.membershipTypes.createMany({
        data: [
            {
                type: "Faculty",
                precedence: 1
            },{
                type: "Staff",
                precedence: 1
            },{
                type: "Tutor",
                precedence: 1
            },
        ]
    });

    await prismaClient.users.create({
        data: {
                fullName: "Doruk Wagle",
                email: "doruk.wagle@gmail.com",
                dob: new Date("2001-03-03"),
                address: "Kathmandu Nepal",
                contactNo: "9829293466",
                gender: "Male",
                roleId: managerRole.roleId,
                rollNumber: "345435345",
                password: await hashPassword("manager123"),
                accountStatus: "Active",
                enrollmentYear: "2021",
                membership: {
                    create: {
                        startDate: new Date("2021-01-01"),
                        expiryDate: new Date("2022-01-01"),
                        membershipTypeId: employeeType.membershipTypeId
                    }
                }
            }
    });

    await prismaClient.globalAttributes.create({
       data: {
           issueValidityDays: 7,
           membershipValidationMonths: 3,
           penaltyPerDay: 10
       }
    });

    await prismaClient.genres.createMany({
        data: [
            { genre: "Thrill" },
            { genre: "Supernatural" },
            { genre: "Slice Of Life" },
            { genre: "Sci-Fi" }
        ]
    });

    await prismaClient.authors.createMany({
        data: [
            {title: "Mr", fullName: "Dave Smart"},
            {title: "Ms", fullName: "Christina Rossetti"}
        ]
    });

    const publisher = await prismaClient.publishers.createMany({
        data: [
            {publisherName: "Finland Publication", address: "finland"},
            {publisherName: "Eastern Coast", address: "California"}
        ]
    });
}

if (process.env.NODE_ENV !== "test")
    main()
        .then(async () => {
            await prismaClient.$disconnect()
        })
        .catch(async (e) => {
            console.error(e)
            await prismaClient.$disconnect()
            process.exit(1)
        })
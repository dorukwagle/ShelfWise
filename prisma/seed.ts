import {hashPassword} from "../src/utils/hash";
import {UserRoles} from "../src/constants/enum";
import prisma from "../src/utils/prismaClient";


async function main() {
    // seed the user roles table
    const managerRole = await prisma.userRoles.create(
        {
            data: {
                role: "Manager",
                precedence: UserRoles.Manager
            }
        }
    );

    await prisma.userRoles.createMany({
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
    const employeeType = await prisma.membershipTypes.create({
        data: {
            type: "Employee",
            precedence: 1
        }
    });

    await prisma.membershipTypes.createMany({
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

    // seed membership table
    const managerMembership = await prisma.memberships.create({
        data: {
            startDate: new Date("2021-01-01"),
            expiryDate: new Date("2022-01-01"),
            membershipTypeId: employeeType.membershipTypeId
        }
    });

    const user = await prisma.users.create({
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
                membershipId: managerMembership.membershipId
            }
    })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
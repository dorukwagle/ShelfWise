import { PrismaClient } from '@prisma/client'
import {hashPassword} from "../src/utils/hash";
const prisma = new PrismaClient()

async function main() {
    // seed the user roles table
    const managerRole = await prisma.userRoles.create(
        {
            data: {
                role: "Manager",
                precedence: 4
            }
        }
    );

    await prisma.userRoles.createMany({
        data: [
            {
                role: "AssistantManager",
                precedence: 3
            },{
                role: "Coordinator",
                precedence: 2
            },{
                role: "Member",
                precedence: 1
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
            startDate: "2021-01-01",
            expiryDate: "2022-01-01",
            membershipTypeId: employeeType.membershipTypeId
        }
    });

    const user = await prisma.users.create({
        data: {
                fullName: "Doruk Wagle",
                email: "doruk.wagle@gmail.com",
                dob: "2001-03-03",
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
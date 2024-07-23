"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hash_1 = require("../src/utils/hash");
const enum_1 = require("../src/constants/enum");
const prismaClient_1 = __importDefault(require("../src/utils/prismaClient"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // seed the user roles table
        const managerRole = yield prismaClient_1.default.userRoles.create({
            data: {
                role: "Manager",
                precedence: enum_1.UserRoles.Manager
            }
        });
        yield prismaClient_1.default.userRoles.createMany({
            data: [
                {
                    role: "AssistantManager",
                    precedence: enum_1.UserRoles.AssistantManager
                }, {
                    role: "Coordinator",
                    precedence: enum_1.UserRoles.Coordinator
                }, {
                    role: "Member",
                    precedence: enum_1.UserRoles.Member
                }
            ]
        });
        // seed the membership table
        const employeeType = yield prismaClient_1.default.membershipTypes.create({
            data: {
                type: "Employee",
                precedence: 1
            }
        });
        yield prismaClient_1.default.membershipTypes.createMany({
            data: [
                {
                    type: "Faculty",
                    precedence: 1
                }, {
                    type: "Staff",
                    precedence: 1
                }, {
                    type: "Tutor",
                    precedence: 1
                },
            ]
        });
        // seed membership table
        const managerMembership = yield prismaClient_1.default.memberships.create({
            data: {
                startDate: new Date("2021-01-01"),
                expiryDate: new Date("2022-01-01"),
                membershipTypeId: employeeType.membershipTypeId
            }
        });
        const user = yield prismaClient_1.default.users.create({
            data: {
                fullName: "Doruk Wagle",
                email: "doruk.wagle@gmail.com",
                dob: new Date("2001-03-03"),
                address: "Kathmandu Nepal",
                contactNo: "9829293466",
                gender: "Male",
                roleId: managerRole.roleId,
                rollNumber: "345435345",
                password: yield (0, hash_1.hashPassword)("manager123"),
                accountStatus: "Active",
                enrollmentYear: "2021",
                membershipId: managerMembership.membershipId
            }
        });
    });
}
main()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prismaClient_1.default.$disconnect();
}))
    .catch((e) => __awaiter(void 0, void 0, void 0, function* () {
    console.error(e);
    yield prismaClient_1.default.$disconnect();
    process.exit(1);
}));

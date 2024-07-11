import { PrismaClient } from '@prisma/client'
import getUserInfo from "../../utils/userUtils";


const getMyInfo = async (userId: string) => {
    return getUserInfo(userId);
}

const updateMyInfo = async (userId: string) => {

}

export {getMyInfo, updateMyInfo};
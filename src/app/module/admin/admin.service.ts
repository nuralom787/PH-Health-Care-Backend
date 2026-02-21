import status from "http-status";
import AppErrors from "../../errorsHelpers/AppErrors";
import { prisma } from "../../lib/prisma";
import { IRequestUser, IUpdateAdminPayload } from "../../shared/interface&types";
import { UserStatus } from "../../../generated/prisma/enums";


const getAllAdmin = async () => {
    try {
        const res = await prisma.doctor.findMany({
            include: {
                user: true,
                specialties: {
                    include: {
                        specialty: true
                    }
                }
            }
        });

        return res;
    } catch (err) {
        console.log(err);
        throw new AppErrors(status.INTERNAL_SERVER_ERROR, "Internal Server Error!");;
    }
};


const getAdminById = async (adminId: string) => {
    try {
        const res = await prisma.doctor.findUnique({
            where: {
                id: adminId
            },
            include: {
                user: true,
                specialties: {
                    include: {
                        specialty: true
                    }
                }
            }
        });

        return res;
    } catch (err) {
        console.log(err);
        throw new AppErrors(status.INTERNAL_SERVER_ERROR, "Internal Server Error!");;
    }
};


const updateAdmin = async (payload: Partial<IUpdateAdminPayload>, adminId: string) => {
    try {
        const isAdminExist = await prisma.admin.findUnique({
            where: {
                id: adminId
            }
        });

        if (!isAdminExist) {
            throw new AppErrors(status.NOT_FOUND, "Admin Or Super Admin Data not found!!");
        };

        const { admin } = payload;

        const updatedData = await prisma.admin.update({
            where: {
                id: adminId
            },
            data: {
                ...admin
            }
        });

        return updatedData;
    }
    catch (err) {
        console.log("Update Doctor Error: ", err);
        throw new AppErrors(status.INTERNAL_SERVER_ERROR, "Internal Server Error!");;
    }
};


const deleteAdmin = async (adminId: string, user: IRequestUser) => {
    const isAdminExist = await prisma.admin.findUnique({
        where: {
            id: adminId,
        }
    });

    if (!isAdminExist) {
        throw new AppErrors(status.NOT_FOUND, "Admin Or Super Admin not found");
    };

    if (isAdminExist.id === user.userId) {
        throw new AppErrors(status.BAD_REQUEST, "You cannot delete yourself");
    };

    const result = await prisma.$transaction(async (tx) => {
        await tx.admin.update({
            where: {
                id: adminId
            },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });

        await tx.user.update({
            where: {
                id: isAdminExist.userId
            },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                status: UserStatus.DELETED
            },
        })

        await tx.session.deleteMany({
            where: { userId: isAdminExist.userId }
        })

        await tx.account.deleteMany({
            where: { userId: isAdminExist.userId }
        })

        const admin = await getAdminById(adminId);

        return admin;
    });

    return result;
}


export const adminService = {
    getAllAdmin,
    getAdminById,
    updateAdmin,
    deleteAdmin,
};
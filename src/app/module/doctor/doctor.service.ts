import status from "http-status";
import AppErrors from "../../../errorsHelpers/AppErrors";
import { prisma } from "../../lib/prisma";
import { IUpdateDoctor } from "../../shared/interface&types";


const getAllDoctors = async () => {
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


const getDoctorById = async (doctorId: string) => {
    try {
        const res = await prisma.doctor.findUnique({
            where: {
                id: doctorId
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


const updateDoctor = async (payload: Partial<IUpdateDoctor>, doctorId: string) => {
    try {
        const updatedData = await prisma.$transaction(async (tx) => {
            const doctorRes = await tx.doctor.update({
                where: {
                    id: doctorId
                },
                data: payload
            });


            const userRes = await tx.user.update({
                where: {
                    id: doctorRes.userId
                },
                data: {
                    name: payload.name,
                    image: payload.profilePhoto
                }
            })

            return { ...doctorRes, user: userRes };
        });

        return updatedData;
    }
    catch (err) {
        console.log("Update Doctor Error: ", err);
        throw new AppErrors(status.INTERNAL_SERVER_ERROR, "Internal Server Error!");;
    }
};


const deleteDoctor = async (doctorId: string) => {
    try {
        const data = await prisma.$transaction(async (tx) => {
            const doctorRes = await tx.doctor.update({
                where: {
                    id: doctorId,
                    isDeleted: false
                },
                data: {
                    isDeleted: true,
                    deletedAt: new Date()
                }
            });


            const userRes = await tx.user.update({
                where: {
                    id: doctorRes.userId,
                    isDeleted: false
                },
                data: {
                    isDeleted: true,
                    deletedAt: new Date()
                }
            });

            return { ...doctorRes, user: userRes };
        });

        return data;
    }
    catch (err) {
        console.log("Delete Doctor Error: ", err);
        throw new AppErrors(status.INTERNAL_SERVER_ERROR, "Internal Server Error!");;
    }
};


export const doctorService = {
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor,
};
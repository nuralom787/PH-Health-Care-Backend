/* eslint-disable @typescript-eslint/no-unused-vars */
import status from "http-status";
import AppErrors from "../../errorsHelpers/AppErrors";
import { prisma } from "../../lib/prisma";
import { IQueryParams, IUpdateDoctor } from "../../shared/interface&types";
import { UserStatus } from "../../../generated/prisma/enums";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { doctorFilterableFields, doctorIncludeConfig, doctorSearchableFields } from "./doctor.constant";
import { Doctor, Prisma } from "../../../generated/prisma/client";


const getAllDoctors = async (query: IQueryParams) => {
    try {
        const queryBuilder = new QueryBuilder<Doctor, Prisma.DoctorWhereInput, Prisma.DoctorInclude>(
            prisma.doctor,
            query,
            {
                searchableFields: doctorSearchableFields,
                filterableFields: doctorFilterableFields,
            }
        );

        const result = await queryBuilder
            .search()
            .filter()
            .where({ isDeleted: false })
            .include({
                user: true,
                specialties: {
                    include: {
                        specialty: true
                    }
                }
            })
            .dynamicInclude(doctorIncludeConfig)
            .paginate()
            .sort()
            .fields()
            .execute()

        return result;


    } catch (err) {
        // console.log(err);
        throw new AppErrors(status.INTERNAL_SERVER_ERROR, "Internal Server Error!");;
    }
};


const getDoctorById = async (doctorId: string) => {
    try {
        const res = await prisma.doctor.findUnique({
            where: {
                id: doctorId,
                isDeleted: false
            },
            include: {
                user: true,
                specialties: {
                    include: {
                        specialty: true
                    }
                },
                appointments: {
                    include: {
                        patient: true,
                        schedule: true,
                        prescription: true,
                    }
                },
                doctorSchedules: {
                    include: {
                        schedule: true
                    }
                },
                review: true
            }
        });

        return res;
    } catch (err) {
        // console.log(err);
        throw new AppErrors(status.INTERNAL_SERVER_ERROR, "Internal Server Error!");;
    }
};


const updateDoctor = async (payload: Partial<IUpdateDoctor>, doctorId: string) => {
    try {
        const isDoctorExist = await prisma.doctor.findUnique({
            where: {
                id: doctorId
            }
        });

        if (!isDoctorExist) {
            throw new AppErrors(status.NOT_FOUND, "Doctor Not Found by this ID!")
        };

        const { doctor: doctorData, specialties } = payload;

        await prisma.$transaction(async (tx) => {
            if (doctorData) {
                await tx.doctor.update({
                    where: {
                        id: doctorId
                    },
                    data: {
                        ...doctorData
                    }
                });
            };

            if (specialties && specialties.length > 0) {
                for (const specialty of specialties) {
                    const { specialtyId, shouldDelete } = specialty;
                    if (shouldDelete) {
                        await tx.doctorSpecialty.delete({
                            where: {
                                doctorId_specialtyId: {
                                    doctorId,
                                    specialtyId,
                                }
                            }
                        })
                    }
                    else {
                        await tx.doctorSpecialty.upsert({
                            where: {
                                doctorId_specialtyId: {
                                    doctorId,
                                    specialtyId
                                }
                            },
                            create: {
                                doctorId,
                                specialtyId
                            },
                            update: {}
                        })
                    }
                };
            };
        });

        const updatedData = await getDoctorById(doctorId);

        return updatedData;
    }
    catch (err) {
        // console.log("Update Doctor Error: ", err);
        throw new AppErrors(status.INTERNAL_SERVER_ERROR, "Internal Server Error!");;
    }
};


const deleteDoctor = async (doctorId: string) => {
    try {
        const isDoctorExist = await prisma.doctor.findUnique({
            where: {
                id: doctorId
            }
        });

        if (!isDoctorExist) {
            throw new AppErrors(status.NOT_FOUND, "Doctor not found by this ID!!");
        };

        await prisma.$transaction(async (tx) => {
            await tx.doctor.update({
                where: {
                    id: doctorId,
                    isDeleted: false
                },
                data: {
                    isDeleted: true,
                    deletedAt: new Date()
                }
            });

            await tx.user.update({
                where: {
                    id: isDoctorExist.userId,
                    isDeleted: false
                },
                data: {
                    isDeleted: true,
                    deletedAt: new Date(),
                    status: UserStatus.DELETED
                }
            });

            await tx.session.deleteMany({
                where: {
                    userId: isDoctorExist.userId
                }
            });

            await tx.doctorSpecialty.deleteMany({
                where: {
                    doctorId
                }
            });
        });

        return { status: status.OK, message: "Doctor deleted successfully." };
    }
    catch (err) {
        // console.log("Delete Doctor Error: ", err);
        throw new AppErrors(status.INTERNAL_SERVER_ERROR, "Internal Server Error!");;
    }
};


export const doctorService = {
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor,
};
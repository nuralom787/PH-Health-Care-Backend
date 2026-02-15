import status from "http-status";
import AppErrors from "../../../errorsHelpers/AppErrors";
import { Role, Specialty } from "../../../generated/prisma/client";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreateDoctorPayload } from "../../shared/interface&types";


const createDoctor = async (payload: ICreateDoctorPayload) => {
    try {
        const specialties: Specialty[] = [];

        for (const specialtyId of payload.specialties) {
            const specialty = await prisma.specialty.findUnique({
                where: {
                    id: specialtyId
                }
            });

            if (!specialty) {
                throw new AppErrors(status.NOT_FOUND, "Specialty not Found!!");
            };

            specialties.push(specialty);
        };

        const userExists = await prisma.user.findUnique({
            where: {
                email: payload.doctor.email
            }
        });

        if (userExists) {
            throw new AppErrors(status.FORBIDDEN, "User with this email is already exists")
        };

        const userData = await auth.api.signUpEmail({
            body: {
                name: payload.doctor.name,
                email: payload.doctor.email,
                password: payload.password,
                role: Role.DOCTOR,
                needPasswordChange: true
            }
        });

        try {
            const result = await prisma.$transaction(async (tx) => {
                const doctorData = await tx.doctor.create({
                    data: {
                        userId: userData.user.id,
                        ...payload.doctor
                    }
                });


                const doctorSpecialtyData = specialties.map(specialty => {
                    return {
                        doctorId: doctorData.id,
                        specialtyId: specialty.id
                    }
                });

                await tx.doctorSpecialty.createMany({
                    data: doctorSpecialtyData
                });

                const doctor = await tx.doctor.findUnique({
                    where: {
                        id: doctorData.id
                    },
                    include: {
                        user: true,
                        specialties: {
                            select: {
                                specialty: {
                                    select: {
                                        title: true,
                                        id: true
                                    }
                                }
                            }
                        }
                    }
                });

                return doctor;
            });

            return result;
        }
        catch (err) {
            console.log(err);
            await prisma.user.delete({
                where: {
                    id: userData.user.id
                }
            });

            throw new AppErrors(status.INTERNAL_SERVER_ERROR, "Internal Server Error!");
        }
    }
    catch (err) {
        console.log(err);
        throw new AppErrors(status.INTERNAL_SERVER_ERROR, "Internal Server Error!");
    }
};

export const userService = {
    createDoctor,
};
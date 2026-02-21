import status from "http-status";
import AppErrors from "../../errorsHelpers/AppErrors";
import { Specialty } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const getAllSpecialties = async () => {
    try {
        const res = await prisma.specialty.findMany({});

        return res;
    } catch (err) {
        console.log(err);
        throw new AppErrors(status.INTERNAL_SERVER_ERROR, "Internal Server Error!");;
    }
};


const createSpecialty = async (payload: Specialty): Promise<Specialty> => {
    try {
        const res = await prisma.specialty.create({
            data: payload
        });

        return res;
    } catch (err) {
        console.log(err);
        throw new AppErrors(status.INTERNAL_SERVER_ERROR, "Internal Server Error!");;
    }
};


const updateSpecialty = async (payload: Specialty): Promise<Specialty> => {
    try {
        const res = await prisma.specialty.update({
            where: {
                id: payload.id
            },
            data: payload
        });

        return res;
    } catch (err) {
        console.log(err);
        throw new AppErrors(status.INTERNAL_SERVER_ERROR, "Internal Server Error!");;
    }
};


const deleteSpecialty = async (id: string) => {
    try {
        const res = await prisma.specialty.update({
            where: {
                id,
                isDeleted: false
            },
            data: {
                isDeleted: true,
                deletedAt: new Date()
            }
        });

        return res;
    } catch (err) {
        console.log(err);
        throw new AppErrors(status.INTERNAL_SERVER_ERROR, "Internal Server Error!");;
    }
};

export const specialtyService = {
    createSpecialty,
    getAllSpecialties,
    updateSpecialty,
    deleteSpecialty
};
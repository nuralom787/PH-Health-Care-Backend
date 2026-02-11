import { Specialty } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const getAllSpecialties = async () => {
    try {
        const res = await prisma.specialty.findMany({});

        return res;
    } catch (err) {
        console.log(err);
        throw err;
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
        throw err;
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
        throw err;
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
                deleted: new Date()
            }
        });

        return res;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

export const specialtyService = {
    createSpecialty,
    getAllSpecialties,
    updateSpecialty,
    deleteSpecialty
};
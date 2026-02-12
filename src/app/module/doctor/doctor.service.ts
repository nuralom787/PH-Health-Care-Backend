import { prisma } from "../../lib/prisma";


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
        throw err;
    }
};


export const doctorService = {
    getAllDoctors,
};
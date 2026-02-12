import { UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { IRegisterUserPayload } from "../../shared/interface&types";
// import { prisma } from "../../lib/prisma";

// const getAllSpecialties = async () => {
//     try {
//         const res = await prisma.specialty.findMany({});

//         return res;
//     } catch (err) {
//         console.log(err);
//         throw err;
//     }
// };


const createUser = async (payload: IRegisterUserPayload) => {
    try {
        const { name, email, password } = payload;

        const res = await auth.api.signUpEmail({
            body: {
                name,
                email,
                password
            }
        });

        if (!res.user) {
            throw new Error("User Not Created! Something was wrong.");
        };

        const patient = await prisma.$transaction(async (tx) => {
            const patientProfile = await tx.patient.create({
                data: {
                    userId: res.user.id,
                    name: payload.name,
                    email: payload.email
                }
            })

            return patientProfile;
        })

        return { ...res, patient };
    } catch (err) {
        console.log(err);
        throw err;
    }
};


const loginUser = async (email: string, password: string) => {
    try {
        const res = await auth.api.signInEmail({
            body: {
                email,
                password
            }
        });

        if (!res.user || res.user.isDeleted) {
            throw new Error("User not signin! Please try again.");
        };

        if (res.user.status === UserStatus.BLOCKED) {
            throw new Error("User is Blocked!!");
        };

        return res;
    } catch (err) {
        console.log(err);
        throw err;
    }
};


// const updateSpecialty = async (payload: Specialty): Promise<Specialty> => {
//     try {
//         const res = await prisma.specialty.update({
//             where: {
//                 id: payload.id
//             },
//             data: payload
//         });

//         return res;
//     } catch (err) {
//         console.log(err);
//         throw err;
//     }
// };


// const deleteSpecialty = async (id: string) => {
//     try {
//         const res = await prisma.specialty.update({
//             where: {
//                 id,
//                 isDeleted: false
//             },
//             data: {
//                 isDeleted: true,
//                 deleted: new Date()
//             }
//         });

//         return res;
//     } catch (err) {
//         console.log(err);
//         throw err;
//     }
// };

export const authService = {
    createUser,
    loginUser,
    // getAllSpecialties,
    // updateSpecialty,
    // deleteSpecialty
};
import { UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { IRegisterUserPayload } from "../../shared/interface&types";


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

        await prisma.$transaction(async (tx) => {
            try {
                const patientProfile = await tx.patient.create({
                    data: {
                        userId: res.user.id,
                        name: payload.name,
                        email: payload.email
                    }
                });

                return { ...res, patientProfile };

            } catch (dbError) {
                console.error("Profile creation failed, deleting auth user...");
                await prisma.user.delete({
                    where: {
                        id: res.user.id
                    }
                });

                throw dbError;
            }
        });
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


export const authService = {
    createUser,
    loginUser,
};
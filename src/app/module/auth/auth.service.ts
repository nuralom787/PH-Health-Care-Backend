import status from "http-status";
import AppErrors from "../../errorsHelpers/AppErrors";
import { UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { IRegisterUserPayload } from "../../shared/interface&types";
import { tokenUtils } from "../../utils/token";


const createUser = async (payload: IRegisterUserPayload) => {
    const { name, email, password } = payload;

    const res = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password
        }
    });

    if (!res.user) {
        throw new AppErrors(status.NOT_MODIFIED, "User Not Created! Something was wrong.");
    };

    try {
        const patient = await prisma.$transaction(async (tx) => {
            const patientProfile = await tx.patient.create({
                data: {
                    userId: res.user.id,
                    name: payload.name,
                    email: payload.email
                }
            });

            return patientProfile;
        }
        );

        const accessToken = tokenUtils.getAccessToken({
            userId: res.user.id,
            name: res.user.name,
            email: res.user.email,
            emailVerified: res.user.emailVerified,
            role: res.user.role,
            status: res.user.status,
            isDeleted: res.user.isDeleted,
        });

        const refreshToken = tokenUtils.getRefreshToken({
            userId: res.user.id,
            name: res.user.name,
            email: res.user.email,
            emailVerified: res.user.emailVerified,
            role: res.user.role,
            status: res.user.status,
            isDeleted: res.user.isDeleted,
        });

        return {
            accessToken,
            refreshToken,
            ...res,
            patient
        }
    }
    catch (err) {
        console.error("Profile creation failed, deleting auth user...", err);
        await prisma.user.delete({
            where: {
                id: res.user.id
            }
        });
        throw new AppErrors(status.INTERNAL_SERVER_ERROR, "Internal Server Error!");
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
            throw new AppErrors(status.NOT_FOUND, "Internal Server Error!");;
        };

        if (res.user.status === UserStatus.BLOCKED) {
            throw new AppErrors(status.FORBIDDEN, "User is Blocked!!");
        };

        const accessToken = tokenUtils.getAccessToken({
            userId: res.user.id,
            name: res.user.name,
            email: res.user.email,
            emailVerified: res.user.emailVerified,
            role: res.user.role,
            status: res.user.status,
            isDeleted: res.user.isDeleted,
        });

        const refreshToken = tokenUtils.getRefreshToken({
            userId: res.user.id,
            name: res.user.name,
            email: res.user.email,
            emailVerified: res.user.emailVerified,
            role: res.user.role,
            status: res.user.status,
            isDeleted: res.user.isDeleted,
        });


        return { ...res, accessToken, refreshToken };
    } catch (err) {
        console.log(err);
        throw new AppErrors(status.INTERNAL_SERVER_ERROR, "Internal Server Error!");
    }
};


export const authService = {
    createUser,
    loginUser,
};
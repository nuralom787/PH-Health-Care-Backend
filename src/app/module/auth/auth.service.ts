import status from "http-status";
import AppErrors from "../../errorsHelpers/AppErrors";
import { UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { IChangePasswordPayload, IRegisterUserPayload, IRequestUser } from "../../shared/interface&types";
import { tokenUtils } from "../../utils/token";
import { jwtUtils } from "../../utils/jwt";
import { env } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";


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


const getMe = async (user: IRequestUser) => {
    const isUserExist = await prisma.user.findUnique({
        where: {
            id: user.userId
        },
        include: {
            patient: {
                include: {
                    appointments: true,
                    review: true,
                    prescriptions: true,
                    medicalReport: true,
                    patientHealthData: true
                }
            },
            doctor: {
                include: {
                    specialties: true,
                    appointments: true,
                    review: true,
                    prescription: true
                }
            },
            admin: true
        }
    });

    if (!isUserExist) {
        throw new AppErrors(status.NOT_FOUND, "User Not Found!!");
    };

    return isUserExist;
};


const getNewToken = async (refreshToken: string, sessionToken: string) => {
    const isSessionTokenExist = await prisma.session.findUnique({
        where: {
            token: sessionToken
        },
        include: {
            user: true
        }
    });

    if (!isSessionTokenExist) {
        throw new AppErrors(status.UNAUTHORIZED, "Unauthorize Access!!");
    };

    const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, env.REFRESH_TOKEN_SECRET);

    if (!verifiedRefreshToken.success && verifiedRefreshToken.err) {
        throw new AppErrors(status.UNAUTHORIZED, "Invalid refresh token");
    };

    const res = verifiedRefreshToken.data as JwtPayload;

    const newAccessToken = tokenUtils.getAccessToken({
        userId: res.userId,
        name: res.name,
        email: res.email,
        emailVerified: res.emailVerified,
        role: res.role,
        status: res.status,
        isDeleted: res.isDeleted,
    });

    const newRefreshToken = tokenUtils.getRefreshToken({
        userId: res.userId,
        name: res.name,
        email: res.email,
        emailVerified: res.emailVerified,
        role: res.role,
        status: res.status,
        isDeleted: res.isDeleted,
    });

    const { token } = await prisma.session.update({
        where: {
            token: sessionToken
        },
        data: {
            token: sessionToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1000),
            updatedAt: new Date(),
        }
    });

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        sessionToken: token
    };
};


const changePassword = async (payload: IChangePasswordPayload, sessionToken: string) => {
    const session = await auth.api.getSession({
        headers: new Headers({
            Authorization: `Bearer ${sessionToken}`
        })
    });

    if (!session) {
        throw new AppErrors(status.UNAUTHORIZED, "invalid session token");
    };

    const { currentPassword, newPassword } = payload;

    const result = await auth.api.changePassword({
        body: {
            currentPassword,
            newPassword,
            revokeOtherSessions: true
        },
        headers: new Headers({
            Authorization: `Bearer ${sessionToken}`
        })
    });


    const accessToken = tokenUtils.getAccessToken({
        userId: session.user.id,
        name: session.user.name,
        email: session.user.email,
        emailVerified: session.user.emailVerified,
        role: session.user.role,
        status: session.user.status,
        isDeleted: session.user.isDeleted,
    });

    const refreshToken = tokenUtils.getRefreshToken({
        userId: session.user.id,
        name: session.user.name,
        email: session.user.email,
        emailVerified: session.user.emailVerified,
        role: session.user.role,
        status: session.user.status,
        isDeleted: session.user.isDeleted,
    });

    return {
        ...result,
        accessToken,
        refreshToken
    };
};


const logoutUser = async (sessionToken: string) => {
    const result = await auth.api.signOut({
        headers: new Headers({
            Authorization: `Bearer ${sessionToken}`
        })
    });

    return result;
};


const verifyEmail = async (email: string, otp: string) => {
    const result = await auth.api.verifyEmailOTP({
        body: {
            email,
            otp
        }
    });

    if (result.status && !result.user.emailVerified) {
        await prisma.user.update({
            where: {
                email
            },
            data: {
                emailVerified: true,
            }
        });
    };
};


export const authService = {
    createUser,
    loginUser,
    getMe,
    getNewToken,
    changePassword,
    logoutUser,
    verifyEmail
};
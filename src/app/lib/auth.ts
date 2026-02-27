import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { bearer, emailOTP } from "better-auth/plugins";
import { sendEmail } from "../utils/email";
import { env } from "../config/env";

export const auth = betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.BETTER_AUTH_URL || "http://localhost:5000", env.FRONTEND_URL],
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true
    },
    emailVerification: {
        sendOnSignUp: true,
        sendOnSignIn: true,
        autoSignInAfterVerification: true
    },
    socialProviders: {
        google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            mapProfileToUser: () => {
                return {
                    role: Role.PATIENT,
                    status: UserStatus.ACTIVE,
                    needPasswordChange: false,
                    emailVerified: true,
                    isDeleted: false,
                    deletedAt: null
                }
            }
        }
    },
    user: {
        additionalFields: {
            role: {
                input: true,
                type: "string",
                required: true,
                defaultValue: Role.PATIENT
            },
            status: {
                type: "string",
                required: true,
                defaultValue: UserStatus.ACTIVE
            },
            needPasswordChange: {
                type: "boolean",
                required: true,
                defaultValue: false
            },
            isDeleted: {
                type: "boolean",
                required: false,
                defaultValue: false
            },
            deletedAt: {
                type: "date",
                required: false,
                defaultValue: null
            },
        }
    },
    session: {
        expiresIn: 60 * 60 * 60 * 24,
        updateAge: 60 * 60 * 60 * 24,
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60 * 60 * 24
        }
    },
    plugins: [
        bearer(),
        emailOTP({
            overrideDefaultEmailVerification: true,
            async sendVerificationOTP({ email, otp, type }) {
                if (type === "email-verification") {
                    const user = await prisma.user.findUnique({
                        where: {
                            email
                        }
                    });

                    if (user && !user.emailVerified) {
                        sendEmail({
                            to: email,
                            subject: "Verify Email",
                            templateName: "otp",
                            templateData: {
                                name: user.name,
                                otp
                            }
                        })
                    }
                } else if (type === "forget-password") {
                    const user = await prisma.user.findUnique({
                        where: {
                            email
                        }
                    });

                    if (user) {
                        sendEmail({
                            to: email,
                            subject: "Password Reset OTP",
                            templateName: "OTP",
                            templateData: {
                                name: user.name,
                                otp
                            }
                        });
                    };
                }
            },
            expiresIn: 2 * 60,
            otpLength: 6,
        })
    ],
    advanced: {
        // disableCSRFCheck:false
        useSecureCookies: false,
        cookies: {
            state: {
                attributes: {
                    sameSite: "none",
                    secure: true,
                    httpOnly: true,
                    path: "/"
                }
            },
            sessionToken: {
                attributes: {
                    sameSite: "none",
                    secure: true,
                    httpOnly: true,
                    path: "/"
                }
            }
        }
    },
    redirectURLs: {
        signIn: `${env.BETTER_AUTH_URL}/api/v1/auth/google/success`,
    },
});
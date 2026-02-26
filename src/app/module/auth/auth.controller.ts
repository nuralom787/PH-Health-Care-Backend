import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { authService } from "./auth.service";
import status from "http-status";
import { tokenUtils } from "../../utils/token";
import AppErrors from "../../errorsHelpers/AppErrors";
import { cookieUtils } from "../../utils/cookie";
import { env } from "../../config/env";
import { auth } from "../../lib/auth";


const createUser = catchAsync(
    async (req: Request, res: Response) => {
        const result = await authService.createUser(req.body);
        const { accessToken, refreshToken, token, ...rest } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, token as string);

        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "User Created Successfully",
            data: {
                token,
                accessToken,
                refreshToken,
                rest
            }
        });
    }
);

const loginUser = catchAsync(
    async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);
        const { accessToken, refreshToken, token, ...rest } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, token);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User Login Successfully",
            data: {
                token,
                accessToken,
                refreshToken,
                rest
            }
        });
    }
);

const googleLogin = catchAsync(
    async (req: Request, res: Response) => {
        const redirectPath = req.query.redirect || "/dashboard";
        const encodedRedirectPath = encodeURIComponent(redirectPath as string);

        const callbackURL = `${env.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodedRedirectPath}`;
        res.render("googleRedirect", {
            callbackURL: callbackURL,
            betterAuthUrl: env.BETTER_AUTH_URL
        });
    }
);

const googleLoginSuccess = catchAsync(
    async (req: Request, res: Response) => {
        const redirectPath = req.query.redirect as string || "/dashboard";
        const sessionToken = req.cookies["better-auth.session_token"];

        if (!sessionToken) {
            return res.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
        };

        const session = await auth.api.getSession({
            headers: {
                "Cookie": `better-auth.session_token=${sessionToken}`
            }
        });

        if (!session) {
            return res.redirect(`${env.FRONTEND_URL}/login?error=no_session_found`);
        };


        if (session && !session.user) {
            return res.redirect(`${env.FRONTEND_URL}/login?error=no_user_found`);
        };

        const result = await authService.googleLoginSuccess(session);

        const { accessToken, refreshToken } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);

        const isValidRedirectPath = redirectPath.startsWith("/") && !redirectPath.startsWith("//");
        const finalRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";

        res.redirect(`${env.FRONTEND_URL}${finalRedirectPath}`);
    }
);

const handleOAuthError = catchAsync(
    async (req: Request, res: Response) => {
        const error = req.query.error as string || "oauth_failed";
        res.redirect(`${env.FRONTEND_URL}/login?error=${error}`);
    }
);

const getMe = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user;
        const result = await authService.getMe(user);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User Profile fetched successfully",
            data: result,
        });
    }
);

const getNewToken = catchAsync(
    async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;
        const betterAuthSessionToken = req.cookies["better-auth.session_token"];
        if (!refreshToken) {
            throw new AppErrors(status.UNAUTHORIZED, "Refresh token is missing");
        };

        const result = await authService.getNewToken(refreshToken, betterAuthSessionToken);
        const { accessToken, refreshToken: newRefreshToken, sessionToken } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, sessionToken);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "New token generated successfully",
            data: {
                accessToken,
                refreshToken: newRefreshToken,
                sessionToken
            },
        });
    }
);

const changePassword = catchAsync(
    async (req: Request, res: Response) => {
        const body = req.body;
        const betterAuthSessionToken = req.cookies["better-auth.session_token"];

        const result = await authService.changePassword(body, betterAuthSessionToken);
        const { accessToken, refreshToken, token } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, token as string);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Password changed successfully",
            data: result
        });
    }
);

const logoutUser = catchAsync(
    async (req: Request, res: Response) => {
        const betterAuthSessionToken = req.cookies["better-auth.session_token"];

        const result = await authService.logoutUser(betterAuthSessionToken);

        cookieUtils.clearCookie(res, 'accessToken', {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        });

        cookieUtils.clearCookie(res, 'refreshToken', {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        });

        cookieUtils.clearCookie(res, 'better-auth.session_token', {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        });

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User logout successfully",
            data: result
        });
    }
);

const verifyEmail = catchAsync(
    async (req: Request, res: Response) => {
        const { email, otp } = req.body;
        await authService.verifyEmail(email, otp);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Verify Email Successfully."
        });
    }
);

const forgetPassword = catchAsync(
    async (req: Request, res: Response) => {
        const { email } = req.body;
        await authService.forgetPassword(email);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Password reset OTP sent to email Successfully."
        });
    }
);

const resetPassword = catchAsync(
    async (req: Request, res: Response) => {
        const { email, otp, newPassword } = req.body;
        await authService.resetpassword(email, otp, newPassword);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Password reset Successfully."
        });
    }
);


export const authController = {
    createUser,
    loginUser,
    googleLogin,
    googleLoginSuccess,
    handleOAuthError,
    getMe,
    getNewToken,
    changePassword,
    logoutUser,
    verifyEmail,
    forgetPassword,
    resetPassword
};
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { authService } from "./auth.service";
import status from "http-status";
import { tokenUtils } from "../../utils/token";
import AppErrors from "../../errorsHelpers/AppErrors";
import { cookieUtils } from "../../utils/cookie";


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


export const authController = {
    createUser,
    loginUser,
    getMe,
    getNewToken,
    changePassword,
    logoutUser,
    verifyEmail
};
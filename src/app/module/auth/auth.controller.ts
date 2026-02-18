import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { authService } from "./auth.service";
import status from "http-status";
import { tokenUtils } from "../../utils/token";


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


export const authController = {
    createUser,
    loginUser,
};
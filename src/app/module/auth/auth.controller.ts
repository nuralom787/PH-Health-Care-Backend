import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { authService } from "./auth.service";
import status from "http-status";


const createUser = catchAsync(
    async (req: Request, res: Response) => {
        const result = await authService.createUser(req.body);

        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "User Created Successfully",
            data: result
        });
    }
);

const loginUser = catchAsync(
    async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User Login Successfully",
            data: result
        });
    }
);


export const authController = {
    createUser,
    loginUser,
};
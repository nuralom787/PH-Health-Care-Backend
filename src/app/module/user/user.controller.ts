import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { userService } from "./user.service";


const createDoctor = catchAsync(
    async (req: Request, res: Response) => {
        const result = await userService.createDoctor(req.body);

        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "Doctor Created Successfully",
            data: result
        });
    }
);


export const userController = {
    createDoctor,
};
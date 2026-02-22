import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { adminService } from "./admin.service";


const getAllAdmin = catchAsync(
    async (req: Request, res: Response) => {
        const result = await adminService.getAllAdmin();

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Fetch Admins Data Successfully",
            data: result
        });
    }
);

const getAdminById = catchAsync(
    async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const result = await adminService.getAdminById(id);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Fetch Admin Data Successfully",
            data: result
        });
    }
);

const updateAdmin = catchAsync(
    async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const payload = req.body;
        const result = await adminService.updateAdmin(payload, id);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Update Admin Data Successfully",
            data: result
        });
    }
);

const deleteAdmin = catchAsync(
    async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const user = req.user;
        const result = await adminService.deleteAdmin(id, user);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Deleted Admin Data Successfully",
            data: result
        });
    }
);


export const adminController = {
    getAllAdmin,
    getAdminById,
    updateAdmin,
    deleteAdmin
};
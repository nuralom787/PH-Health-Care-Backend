import { Request, Response } from "express";
import { specialtyService } from "./specialty.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";


const getAllSpecialties = catchAsync(
    async (req: Request, res: Response) => {
        const result = await specialtyService.getAllSpecialties();

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Fetch All Specialties Successfully",
            data: result
        });
    }
);


const createSpecialty = catchAsync(
    async (req: Request, res: Response) => {
        // console.log(req.body);
        // const result = await specialtyService.createSpecialty(req.body);

        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "Specialty Created Successfully",
            data: req.file
        });
    }
);


const updateSpecialty = catchAsync(
    async (req: Request, res: Response) => {
        const result = await specialtyService.updateSpecialty(req.body);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Update Specialty Data Successfully",
            data: result
        });
    }
);


const deleteSpecialty = catchAsync(
    async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const result = await specialtyService.deleteSpecialty(id);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Specialty Deleted Successfully",
            data: result
        });
    }
);


export const specialtyController = {
    createSpecialty,
    getAllSpecialties,
    updateSpecialty,
    deleteSpecialty,
};
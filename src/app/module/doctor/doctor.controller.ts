import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { doctorService } from "./doctor.service";
import { IQueryParams } from "../../shared/interface&types";


const getAllDoctors = catchAsync(
    async (req: Request, res: Response) => {
        const query = req.query;

        const result = await doctorService.getAllDoctors(query as IQueryParams);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Fetch Doctors Data Successfully",
            data: result.data,
            meta: result.meta
        });
    }
);

const getDoctorById = catchAsync(
    async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const result = await doctorService.getDoctorById(id);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Fetch Doctor Data Successfully",
            data: result
        });
    }
);

const updateDoctor = catchAsync(
    async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const payload = req.body;
        const result = await doctorService.updateDoctor(payload, id);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Update Doctor Data Successfully",
            data: result
        });
    }
);

const deleteDoctor = catchAsync(
    async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const result = await doctorService.deleteDoctor(id);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Deleted Doctor Data Successfully",
            data: result
        });
    }
);


export const doctorController = {
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor
};
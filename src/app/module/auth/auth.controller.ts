import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { authService } from "./auth.service";


// const getAllSpecialties = catchAsync(
//     async (req: Request, res: Response) => {
//         const result = await specialtyService.getAllSpecialties();

//         sendResponse(res, {
//             httpStatusCode: 200,
//             success: true,
//             message: "Fetch All Specialties Successfully",
//             data: result
//         });
//     }
// );


const createUser = catchAsync(
    async (req: Request, res: Response) => {
        const result = await authService.createUser(req.body);

        sendResponse(res, {
            httpStatusCode: 201,
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
            httpStatusCode: 201,
            success: true,
            message: "User Login Successfully",
            data: result
        });
    }
);


// const updateSpecialty = catchAsync(
//     async (req: Request, res: Response) => {
//         const result = await specialtyService.updateSpecialty(req.body);

//         sendResponse(res, {
//             httpStatusCode: 200,
//             success: true,
//             message: "Update Specialty Data Successfully",
//             data: result
//         });
//     }
// );


// const deleteSpecialty = catchAsync(
//     async (req: Request, res: Response) => {
//         const id = req.params.id as string;
//         const result = await specialtyService.deleteSpecialty(id);

//         sendResponse(res, {
//             httpStatusCode: 200,
//             success: true,
//             message: "Specialty Deleted Successfully",
//             data: result
//         });
//     }
// );


export const authController = {
    createUser,
    loginUser
    // getAllSpecialties,
    // updateSpecialty,
    // deleteSpecialty,
};
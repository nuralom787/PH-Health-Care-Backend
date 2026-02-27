/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import status from "http-status";
import { TErrorResponse, TErrorSources } from "../shared/interface&types";
import z from "zod";
import AppErrors from "../errorsHelpers/AppErrors";
import { deleteFileFormCloudinary } from "../config/cloudinary.config";

export const globalErrorHandler = async (err: any, req: Request, res: Response, next: NextFunction) => {
    if (env.NODE_ENV === "development") {
        console.log("Error From Global Error Handler: ", err);
    };

    if (req.file) {
        await deleteFileFormCloudinary(req.file.path);
    };

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const imageUrls = req.files.map((file) => file.path);

        await Promise.all(imageUrls.map(url => deleteFileFormCloudinary(url)));
    };

    let errorSources: TErrorSources[] = [];
    let statusCode: number = status.INTERNAL_SERVER_ERROR;
    let message: string = "Internal Server Error";
    let stack: string | undefined = undefined;

    if (err instanceof z.ZodError) {
        statusCode = status.BAD_REQUEST;
        message = "Zod Validation Error";

        err.issues.forEach(issue => {
            errorSources.push({
                path: issue.path.length > 1 ? issue.path.join(" => ") : issue.path[0].toString(),
                message: issue.message,
            });
        });
        stack = err.stack;
    }
    else if (err instanceof AppErrors) {
        statusCode = err.statusCode;
        message = err.message;
        stack = err.stack;
        errorSources = [
            {
                path: "",
                message: err.message
            }
        ];
    }
    else if (err instanceof Error) {
        statusCode = status.INTERNAL_SERVER_ERROR;
        message = err.message;
        stack = err.stack;
        errorSources = [
            {
                path: "",
                message: err.message
            }
        ];
    }

    const errorResponse: TErrorResponse = {
        success: false,
        message: message,
        errorSources,
        stack: env.NODE_ENV === "development" ? stack : undefined,
        error: env.NODE_ENV === "development" ? err : undefined,
    };

    res.status(statusCode).json(errorResponse);
};
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import status from "http-status";
import { TErrorResponse, TErrorSources } from "../app/shared/interface&types";
import z from "zod";

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (env.NODE_ENV === "development") {
        console.log("Error From Global Error Handler: ", err);
    };

    let errorSources: TErrorSources[] = [];
    let statusCode: number = status.INTERNAL_SERVER_ERROR;
    let message: string = "Internal Server Error";

    if (err instanceof z.ZodError) {
        statusCode = status.BAD_REQUEST;
        message = "Zod Validation Error";

        err.issues.forEach(issue => {
            errorSources.push({
                path: issue.path.length > 1 ? issue.path.join(" => ") : issue.path[0].toString(),
                message: issue.message,
            });
        });
    };

    const errorResponse: TErrorResponse = {
        success: false,
        message: message,
        errorSources,
        error: env.NODE_ENV === "development" ? err : undefined,
    };

    res.status(statusCode).json(errorResponse);
};
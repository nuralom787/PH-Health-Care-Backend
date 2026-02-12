import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import status from "http-status";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (env.NODE_ENV === "development") {
        console.log("Error From Global Error Handler: ", err);
    };

    // eslint-disable-next-line prefer-const
    let statusCode: number = status.INTERNAL_SERVER_ERROR;
    // eslint-disable-next-line prefer-const
    let message: string = "Internal Server Error";

    res.status(statusCode).json({
        success: false,
        message: message,
        error: err.message
    })
}
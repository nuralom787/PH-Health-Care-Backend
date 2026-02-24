import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import { specialtyRoutes } from "./app/module/specialty/specialty.route";
import { authRoutes } from "./app/module/auth/auth.route";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { userRoutes } from "./app/module/user/user.route";
import { doctorRoutes } from "./app/module/doctor/doctor.route";
import status from "http-status";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import path from "node:path";

const app: Application = express();

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(cookieParser());

// ! For Social and user authentications
app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`))

// ! For Social and user authentications
app.use("/api/auth", toNodeHandler(auth));

// ! (User/Auth) Routes.
app.use("/api/v1/auth", authRoutes);

// ! Specialty Routes.
app.use("/api/v1/specialties", specialtyRoutes);

// ! (Doctors/admin/superAdmin) Creation Routes.
app.use("/api/v1/users", userRoutes);

// ! Doctors Routes.
app.use("/api/v1/doctors", doctorRoutes);

// ! Global Error Handler.
app.use(globalErrorHandler);


// ! Basic route
app.get('/', async (req: Request, res: Response) => {
    // throw new AppErrors(status.BAD_REQUEST, "Testing Errors")
    res.status(status.OK).json({
        success: true,
        message: "Running PH Health Care Server..."
    });
});

// ! Not Found.
app.use(notFound);

export default app;
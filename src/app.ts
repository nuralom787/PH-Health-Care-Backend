import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import { specialtyRoutes } from "./app/module/specialty/specialty.route";
import { authRoutes } from "./app/module/auth/auth.route";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { notFound } from "./middleware/notFound";

const app: Application = express();

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(cookieParser());

// ! (User/Auth) Routes.
app.use("/api/v1/auth", authRoutes);

// ! Specialty Routes.
app.use("/api/v1/specialties", specialtyRoutes);

// ! Global Error Handler.
app.use(globalErrorHandler);


// ! Basic route
app.get('/', async (req: Request, res: Response) => {
    res.status(200).json({ message: "Running PH Health Care Server..." });
});

// ! Not Found.
app.use(notFound);

export default app;
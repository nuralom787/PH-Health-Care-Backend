import { Router } from "express";
import { userController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { createAdminZodSchema, createDoctorZodSchema } from "./user.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/create-doctor", /*checkAuth(Role.ADMIN, Role.SUPER_ADMIN),*/ validateRequest(createDoctorZodSchema), userController.createDoctor);

router.post("/create-admin", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(createAdminZodSchema), userController.createAdmin);


export const userRoutes = router;
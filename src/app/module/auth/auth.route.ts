import { Router } from "express";
import { authController } from "./auth.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/register", authController.createUser);

router.post("/login", authController.loginUser);

router.get("/me", checkAuth(Role.PATIENT, Role.DOCTOR, Role.ADMIN, Role.SUPER_ADMIN), authController.getMe);

router.post("/refresh-token", authController.getNewToken);

export const authRoutes = router;
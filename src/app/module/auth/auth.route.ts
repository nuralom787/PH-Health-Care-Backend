import { Router } from "express";
import { authController } from "./auth.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get("/me", checkAuth(Role.PATIENT, Role.DOCTOR, Role.ADMIN, Role.SUPER_ADMIN), authController.getMe);

router.get("/login/google", authController.googleLogin);

router.get("/google/success", authController.googleLoginSuccess);

router.get("/oauth/error", authController.handleOAuthError);

router.post("/register", authController.createUser);

router.post("/login", authController.loginUser);

router.post("/refresh-token", authController.getNewToken);

router.post("/refresh-token", authController.getNewToken);

router.post("/change-password", checkAuth(Role.PATIENT, Role.DOCTOR, Role.ADMIN, Role.SUPER_ADMIN), authController.changePassword);

router.post("/logout", checkAuth(Role.PATIENT, Role.DOCTOR, Role.ADMIN, Role.SUPER_ADMIN), authController.logoutUser);

router.post("/verify-email", authController.verifyEmail);

router.post("/forget-password", authController.forgetPassword);

router.post("/reset-password", authController.resetPassword);

export const authRoutes = router;
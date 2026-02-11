import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

// router.get("/", specialtyController.getAllSpecialties)

router.post("/register", authController.createUser);

router.post("/login", authController.loginUser);

// router.patch("/update-specialty", specialtyController.updateSpecialty);

// router.delete("/delete-specialty/:id", specialtyController.deleteSpecialty);


export const authRoutes = router;
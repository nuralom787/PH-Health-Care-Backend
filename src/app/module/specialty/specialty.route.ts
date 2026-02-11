import { Router } from "express";
import { specialtyController } from "./specialty.controller";

const router = Router();

router.get("/", specialtyController.getAllSpecialties)

router.post("/create-specialty", specialtyController.createSpecialty);

router.patch("/update-specialty", specialtyController.updateSpecialty);

router.delete("/delete-specialty/:id", specialtyController.deleteSpecialty);


export const specialtyRoutes = router;
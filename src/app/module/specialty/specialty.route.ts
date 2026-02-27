import { Router } from "express";
import { specialtyController } from "./specialty.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";
import { validateRequest } from "../../middleware/validateRequest";
import { specialtyValidation } from "./specialty.validation";

const router = Router();

router.get("/", specialtyController.getAllSpecialties)

router.post("/create-specialty", /*checkAuth(Role.ADMIN, Role.SUPER_ADMIN),*/ multerUpload.single("file"), validateRequest(specialtyValidation.createSpecialtyZodSchema), specialtyController.createSpecialty);

router.patch("/update-specialty", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), specialtyController.updateSpecialty);

router.delete("/delete-specialty/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), specialtyController.deleteSpecialty);


export const specialtyRoutes = router;
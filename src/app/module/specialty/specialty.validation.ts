import z from "zod";

const createSpecialtyZodSchema = z.object({
    title: z.string("Title s required"),
    description: z.string().optional()
});


export const specialtyValidation = {
    createSpecialtyZodSchema
}
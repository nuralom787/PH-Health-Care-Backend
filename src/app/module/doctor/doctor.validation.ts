import z from "zod";
import { Gender } from "../../../generated/prisma/enums";


export const updateDoctorZodSchema = z.object({
    name: z.string().min(5, "minimum 5 and maximum 20 character").max(20, "minimum 5 and maximum 20 character"),
    profilePhoto: z.string(),
    contactNumber: z.string().min(11, "minimum 11 character").max(14, "maximum 14 character"),
    address: z.string().min(10, "minimum 10 and maximum 100 character").max(100),
    experience: z.int("Experience must be integer").nonnegative("Experience cannot be negative"),
    gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHERS], "Gender must be either MALE, FEMALE, OR OTHERS"),
    appointmentFee: z.number("Appointment fee must be a number").nonnegative("Appointment fee cannot be negative"),
    qualification: z.string("Qualification is required").min(2, "minimum 2 and maximum 50 character").max(50, "minimum 2 and maximum 50 character"),
    currentWorkingPlace: z.string("Current Working Place is required").min(2, "current working place must be at least 2 character").max(50, "current working place at most 50 character"),
    designation: z.string("designation is required").min(2, "minimum 2 and maximum 50 character").max(50),
}).partial();
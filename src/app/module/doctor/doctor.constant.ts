import { Prisma } from "../../../generated/prisma/client";

export const doctorSearchableFields = ['name', 'email', 'contactNumber', 'registrationNumber', 'qualification', 'currentWorkingPlace', 'designation', 'specialties.specialty.title'];

export const doctorFilterableFields = ['gender', 'isDeleted', 'appointmentFee', 'experience', 'registrationNumber', 'specialties.specialtyId', 'user.role', 'currentWorkingPlace', 'designation', 'qualification', 'specialties.specialty.title'];

export const doctorIncludeConfig: Partial<Record<keyof Prisma.DoctorInclude, Prisma.DoctorInclude[keyof Prisma.DoctorInclude]>> = {
    user: true,
    specialties: {
        include: {
            specialty: true
        }
    },
    appointments: {
        include: {
            patient: true,
            doctor: true
        }
    },
    doctorSchedules: {
        include: {
            schedule: true
        }
    },
    prescription: true,
    review: true
};
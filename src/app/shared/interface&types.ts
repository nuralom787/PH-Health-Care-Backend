import { Gender, Role } from "../../generated/prisma/enums";

export interface IRegisterUserPayload {
    name: string;
    email: string;
    password: string;
};

// ! Doctor Related Interfaces.

export interface ICreateDoctorPayload {
    password: string;
    doctor: {
        name: string;
        email: string;
        profilePhoto?: string;
        contactNumber?: string;
        address?: string;
        registrationNumber: string;
        experience?: number;
        gender: Gender;
        appointmentFee: number;
        qualification: string;
        currentWorkingPlace: string;
        designation: string;
    };
    specialties: string[];
};

export interface IUpdateDoctorSpecialtyPayload {
    specialtyId: string;
    shouldDelete?: boolean;
}

export interface IUpdateDoctor {
    doctor: {
        name?: string;
        profilePhoto?: string;
        contactNumber?: string;
        address?: string;
        experience?: number;
        gender?: Gender;
        appointmentFee?: number;
        qualification?: string;
        currentWorkingPlace?: string;
        designation?: string;
    },
    specialties?: IUpdateDoctorSpecialtyPayload[];
};


// ! Errors Related Interfaces.

export interface TErrorSources {
    path: string;
    message: string;
};

export interface TErrorResponse {
    success: boolean;
    message: string;
    errorSources?: TErrorSources[];
    error?: unknown;
    stack?: string
};


// ! Admin Related Interfaces.


export interface ICreateAdminPayload {
    password: string;
    admin: {
        name: string;
        email: string;
        profilePhoto?: string;
        contactNumber?: string;
    }
    role: "ADMIN" | "SUPER_ADMIN";
};

export interface IUpdateAdminPayload {
    admin?: {
        name?: string;
        profilePhoto?: string;
        contactNumber?: string;
    }
};

export interface IRequestUser {
    userId: string;
    role: Role;
    email: string;
};


// ! Password Related Interfaces.

export interface IChangePasswordPayload {
    currentPassword: string,
    newPassword: string
};

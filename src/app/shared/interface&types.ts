/* eslint-disable @typescript-eslint/no-explicit-any */
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


// ! Email Sending Related Interfaces.

export interface SendEmailOptions {
    to: string;
    subject: string;
    templateName: string;
    templateData: Record<string, any>;
    attachments?: {
        fileName: string;
        content: Buffer | string;
        contentType: string;
    }[]
};


// ! Query Builder Related Interfaces.

export interface PrismaFindManyArgs {
    where?: Record<string, unknown>;
    include?: Record<string, unknown>;
    select?: Record<string, boolean | Record<string, unknown>>;
    orderBy?: Record<string, unknown | Record<string, unknown>>;
    skip?: number;
    take?: number;
    cursor?: Record<string, unknown>;
    distinct?: string[] | string;
    [key: string]: unknown;
};

export interface PrismaCountArgs {
    where?: Record<string, unknown>;
    include?: Record<string, unknown>;
    select?: Record<string, boolean | Record<string, unknown>>;
    orderBy?: Record<string, unknown | Record<string, unknown>>;
    skip?: number;
    take?: number;
    cursor?: Record<string, unknown>;
    distinct?: string[] | string;
    [key: string]: unknown;
};

export interface PrismaModelDelegate {
    findMany(args?: any): Promise<any[]>;
    count(args?: any): Promise<number>;
};

export interface IQueryParams {
    searchTerm?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    fields?: string;
    includes?: string;
    [key: string]: string | undefined;
};

export interface IQueryConfig {
    searchableFields?: string[];
    filterableFields?: string[];
};

export interface PrismaStringFilter {
    contains?: string;
    startsWith?: string;
    endsWith?: string;
    mode?: 'insensitive' | 'default';
    equals?: string;
    in?: string[];
    notIn?: string[];
    lt?: string;
    gt?: string;
    gte?: string;
    not?: PrismaStringFilter | string;
};

export interface PrismaNumberFilter {
    equals?: number;
    in?: number[];
    notIn?: number[];
    lt?: number;
    lte?: number;
    gt?: number;
    gte?: number;
    not?: PrismaNumberFilter | number;
};

export interface PrismaWhereConditions {
    OR?: Record<string, unknown>[];
    AND?: Record<string, unknown>[];
    NOT?: Record<string, unknown>[];
    [key: string]: unknown;
};

export interface IQueryResult<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }
};

import { NextFunction, Request, Response } from "express";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { cookieUtils } from "../utils/cookie";
import AppErrors from "../errorsHelpers/AppErrors";
import status from "http-status";
import { prisma } from "../lib/prisma";
import { jwtUtils } from "../utils/jwt";
import { env } from "../config/env";

export const checkAuth = (...authRoles: Role[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        // * Session Token Verification.
        const sessionToken = cookieUtils.getCookie(req, "better-auth.session_token");

        if (!sessionToken) {
            throw new AppErrors(status.UNAUTHORIZED, "Unauthorize Access!")
        };

        if (sessionToken) {
            const sessionExists = await prisma.session.findFirst({
                where: {
                    token: sessionToken,
                    expiresAt: {
                        gt: new Date()
                    }
                },
                include: {
                    user: true
                }
            });

            if (sessionExists && sessionExists.user) {
                const user = sessionExists.user;
                const newDate = new Date()
                const expireAt = new Date(sessionExists.expiresAt);
                const createdAt = sessionExists.createdAt;

                const sessionLifeTime = expireAt.getTime() - createdAt.getTime();
                const timeRemaining = expireAt.getTime() - newDate.getTime();
                const percentRemaining = (timeRemaining / sessionLifeTime) * 100;

                if (percentRemaining < 20) {
                    res.setHeader("X-session-Refresh", 'true');
                    res.setHeader("X-session-Expires-At", expireAt.toISOString());
                    res.setHeader("X-Time-Remaining", timeRemaining.toString());

                    console.log("Session Expiring Soon...");
                };

                if (user.status === UserStatus.BLOCKED || user.status === UserStatus.DELETED) {
                    throw new AppErrors(status.UNAUTHORIZED, "Unauthorize Access");
                };

                if (user.isDeleted) {
                    throw new AppErrors(status.UNAUTHORIZED, "Unauthorize Access! user is Deleted");
                };

                if (authRoles.length > 0 && !authRoles.includes(user.role)) {
                    throw new AppErrors(status.FORBIDDEN, "Forbidden Access!! You do not have permission to access this resource.")
                };

                req.user = {
                    userId: user.id,
                    role: user.role,
                    email: user.email
                };
            };

            const accessToken = cookieUtils.getCookie(req, 'accessToken');

            if (!accessToken) {
                throw new AppErrors(status.UNAUTHORIZED, "Unauthorize Access! no access token provided.");
            };
        };

        // * Access Token Verification.
        const accessToken = cookieUtils.getCookie(req, "accessToken");

        if (!accessToken) {
            throw new AppErrors(status.UNAUTHORIZED, "Unauthorize Access!");
        };

        const verifiedToken = jwtUtils.verifyToken(accessToken, env.ACCESS_TOKEN_SECRET);

        if (!verifiedToken.success) {
            throw new AppErrors(status.UNAUTHORIZED, "Unauthorize Access!");
        };

        if (authRoles.length > 0 && !authRoles.includes(verifiedToken.data!.role as Role)) {
            throw new AppErrors(status.FORBIDDEN, "Forbidden Access!");
        };

        next();
    } catch (error) {
        next(error);
    }
};
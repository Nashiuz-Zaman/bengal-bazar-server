import { RequestHandler } from "express";
import { IAuthSecureRequest } from "../../types/generic.js";
import { verifyToken } from "../../utils/jsonWebTokens.js";
import { config } from "../../config/env.js";
import { IAuthJwtPayload } from "../../types/auth.js";
import { userExists } from "../modules/user/repository/user.query.repository.js";
import { ApiError } from "../../utils/ApiError.js";
import { UserRole } from "../../generated/prisma/enums.js";
import { hasElements } from "../../utils/hasElements.js";

/**
 * Enforces authentication and role-based access control (RBAC).
 */
export const protect = (allowedRoles: UserRole[] = []): RequestHandler => {
  return async (req, res, next) => {
    // 1. Prioritize HTTP-only Cookie
    const token = req.cookies?.accessToken;

    // 2. Strict Check
    if (!token) {
      throw ApiError.Unauthorized("Authentication required. Please log in.");
    }

    // 3. Verify Token
    const result = await verifyToken<IAuthJwtPayload>(token, config.jwtSecret!);

    if (!result.valid || !result.decoded) {
      throw ApiError.Unauthorized(
        "Invalid or expired session. Please log in again.",
      );
    }

    const decoded = result.decoded;

    // 4. Database Integrity Check
    const user = await userExists(decoded.userId!);

    if (!user || user.status !== "ACTIVE") {
      throw ApiError.Unauthorized("Invalid user.");
    }

    // 5. Role-Based Access Control (RBAC)
    if (hasElements(allowedRoles) && !allowedRoles.includes(user.role)) {
      throw ApiError.Forbidden(
        "You do not have permission to access this resource.",
      );
    }

    // 6. Grant Access
    (req as IAuthSecureRequest).decoded = decoded;

    next();
  };
};

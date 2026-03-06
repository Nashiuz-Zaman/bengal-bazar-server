import { RequestHandler } from "express";
import { IAuthSecureRequest } from "../../types/generic.js";
import { verifyToken } from "../../utils/jsonWebTokens.js";
import { config } from "../../config/env.js";
import { IAuthJwtPayload } from "../../types/auth.js";
import { userExists } from "../modules/user/repository/user.query.repository.js";
import { cleanCookie } from "../../utils/cookie.js";

/**
 * Checks if there is an user logged in or proceeds as a guest.
 */
export const optionalProtect: RequestHandler = async (req, res, next) => {
  try {
    // Prioritize HTTP-only Cookie
    let token = req.cookies?.accessToken;

    // If no token, they are a guest. Move on.
    if (!token) return next();

    // 4. Verify Token
    const result = await verifyToken<IAuthJwtPayload>(token, config.jwtSecret!);

    if (result.valid) {
      const decoded = result.decoded;
      const user = await userExists(decoded.userId!);

      if (user?.id && user.status === "ACTIVE") {
        (req as IAuthSecureRequest).decoded = decoded;
      }
    } else {
      cleanCookie(res, "accessToken");
    }

    next();
  } catch (error) {
    // Catching JWT errors (expired/malformed)
    // We don't throw error; we just proceed as a guest.
    next();
  }
};

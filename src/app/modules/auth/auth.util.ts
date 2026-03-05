import crypto from "crypto";
import { setCookie } from "../../../utils/cookie.js";

/**
 * Creates a SHA-256 hash of a token string.
 * This ensures that even if our database is leaked, the refresh tokens
 * cannot be used by an attacker to impersonate users.
 */
export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

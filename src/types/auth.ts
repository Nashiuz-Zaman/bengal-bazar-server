import { JwtPayload } from "jsonwebtoken";

export interface IAuthJwtPayload extends JwtPayload {
  userId?: string;
  email?: string;
  role?: string;
}

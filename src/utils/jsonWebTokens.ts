import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";

export interface IJwtPayload extends JwtPayload {
  userId?: string;
  email?: string;
}

type TTimeUnit = "ms" | "s" | "m" | "h" | "d" | "w" | "y";

export interface ISignOptions {
  expiresIn?: number | `${number}${TTimeUnit}`;
}

export const generateToken = (
  payload: IJwtPayload,
  secret: string,
  expiresIn: ISignOptions["expiresIn"],
) => {
  return jwt.sign(payload, secret, {
    expiresIn,
  });
};

type TVerifyResult =
  | { valid: true; decoded: IJwtPayload }
  | { valid: false; error: VerifyErrors };

export const verifyToken = (
  token: string,
  secret: string,
): Promise<TVerifyResult> => {
  return new Promise((resolve) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        resolve({ valid: false, error: err });
      } else {
        // Cast decoded to IJwtPayload safely
        resolve({ valid: true, decoded: decoded as IJwtPayload });
      }
    });
  });
};

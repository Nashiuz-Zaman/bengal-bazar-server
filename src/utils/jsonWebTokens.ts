import jwt, { VerifyErrors } from "jsonwebtoken";

type TTimeUnit = "ms" | "s" | "m" | "h" | "d" | "w" | "y";

export interface ISignOptions {
  expiresIn?: number | `${number}${TTimeUnit}`;
}

export const generateToken = <T extends Record<string, any>>(
  payload: T,
  secret: string,
  expiresIn: ISignOptions["expiresIn"],
) => {
  return jwt.sign(payload, secret, {
    expiresIn,
  });
};

type TVerifyResult<TDecoded> =
  | { valid: true; decoded: TDecoded }
  | { valid: false; error: VerifyErrors };

export const verifyToken = <T extends Record<string, any>>(
  token: string,
  secret: string,
): Promise<TVerifyResult<T>> => {
  return new Promise((resolve) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        resolve({ valid: false, error: err });
      } else {
        resolve({ valid: true, decoded: decoded as T });
      }
    });
  });
};

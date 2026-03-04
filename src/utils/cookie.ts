import { Response } from "express";

interface ICookieOptions {
  cookieName: string;
  cookieContent: string | Record<string, any>;
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  path?: string;
}

export const setCookie = (
  res: Response,
  {
    cookieName,
    cookieContent,
    maxAge = 10 * 60 * 1000, // default 10 mins
    httpOnly = true,
    secure = true,
    sameSite = "lax",

    path = "/",
  }: ICookieOptions,
) => {
  res.cookie(cookieName, cookieContent, {
    maxAge,
    httpOnly,
    secure,
    sameSite,

    path,
  });
};

interface ICleanCookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  domain?: string;
  path?: string;
}

export const cleanCookie = (
  res: Response,
  cookieName: string,
  {
    httpOnly = true,
    secure = true,
    sameSite = "lax",

    path = "/",
  }: ICleanCookieOptions = {},
): void => {
  res.clearCookie(cookieName, {
    httpOnly,
    secure,
    sameSite,

    path,
  });

  res.cookie(cookieName, "", {
    expires: new Date(0),
    httpOnly,
    secure,
    sameSite,

    path,
  });
};

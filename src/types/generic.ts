import { Request } from "express";
import { IAuthJwtPayload } from "./auth.js";

export type TStringKeyOf<T> = Extract<keyof T, string>;

export interface IQueryMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type TAllowedQueryExtraField<TResource, TDefaultFields> = Exclude<
  TStringKeyOf<TResource>,
  TDefaultFields
>;

export interface IMultipleResourceQueryParams {
  page: number;
  q: string;
  search: string;
  limitFields?: string;
  limit?: number;
}

export interface IAuthSecureRequest extends Request {
  decoded?: IAuthJwtPayload;
}

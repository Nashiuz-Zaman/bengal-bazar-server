export type TUserQueryDefaultFields =
  | "name"
  | "id"
  | "email"
  | "phone"
  | "image"
  | "status"
  | "role"
  | "lastLoginAt"
  | "isVerified";

export interface ISingleUserQuery {
  email?: string;
  id?: string;
}

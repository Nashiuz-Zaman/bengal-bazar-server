import { RequestHandler } from "express";
import { getSignedUrl } from "./cloudinary.service.js";
import { sendSuccess } from "../../../utils/sendSuccess.js";
import { ApiError } from "../../../utils/ApiError.js";


export const getSignedUrlController: RequestHandler = (req, res) => {
  const folder =
    typeof req.query.folder === "string" ? req.query.folder : undefined;
  const signedUrl = getSignedUrl(folder);

  if (signedUrl) return sendSuccess(res, { data: signedUrl });

  throw ApiError.Internal("Signed Url didn't generate, server error");
};

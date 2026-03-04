import { config } from "../../../config/env.js";
import { v2 as cloudinary } from "cloudinary";

const cloudName = config.cloudinaryCloud;
const apiSecret = config.cloudinaryApiSecret;
const apiKey = config.cloudinaryApiKey;

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export const getSignedUrl = (folder = "bengal-bazar/uploads") => {
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    apiSecret as string,
  );

  const url =
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload` +
    `?api_key=${apiKey}` +
    `&timestamp=${timestamp}` +
    `&signature=${signature}` +
    `&folder=${encodeURIComponent(folder)}` +
    `&quality=auto` +
    `&fetch_format=auto`;

  return url;
};

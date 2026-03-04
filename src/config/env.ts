import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export const config = {
  postgresConnecionStr: process.env.DATABASE_URL,
  smtpUser: process.env.SMTP_USER_EMAIL,
  emailSender: process.env.SMTP_USER_EMAIL,
  smtpPass: process.env.SMTP_APP_PASSWORD,
  environment: process.env.NODE_ENV || "development",
  cloudinaryCloud: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  jwtSecret: process.env.JWT_SECRET,
};

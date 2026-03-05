// imports
import { Router } from "express";
import { getSignedUrlController } from "./cloudinary.controller.js";

// create instance
const cloudinaryRouter = Router();

cloudinaryRouter.get("/signed-url", getSignedUrlController);

export { cloudinaryRouter };

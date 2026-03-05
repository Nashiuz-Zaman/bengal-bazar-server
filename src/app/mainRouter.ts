import { Router } from "express";

import { cloudinaryRouter } from "./modules/cloudinary/cloudinary.router.js";
import { userRouter } from "./modules/user/user.router.js";
import { authRouter } from "./modules/auth/auth.router.js";

const mainRouter = Router();

mainRouter.use("/cloudinary", cloudinaryRouter);
mainRouter.use("/users", userRouter);
mainRouter.use("/auth", authRouter);

export default mainRouter;

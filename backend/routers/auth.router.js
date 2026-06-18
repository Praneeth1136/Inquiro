import { Router } from "express";
import { register, verifyEmail, login, logout, getMe, resendVerification, updateSystemPrompt } from '../controller/auth.controller.js';
import { registerValidator, loginValidator, resendVerificationValidator } from "../validators/auth.validator.js";
import { authUser } from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.post("/register", registerValidator, register);
authRouter.post("/login", loginValidator, login);
authRouter.post("/logout", logout);
authRouter.get("/get-me", authUser, getMe);
authRouter.get("/verify-email", verifyEmail);
authRouter.post("/resend-verification", resendVerificationValidator, resendVerification);

authRouter.patch("/system-prompt", authUser, updateSystemPrompt);

export default authRouter;
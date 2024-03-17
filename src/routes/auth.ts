import { Router } from "express";
const router = Router();

import AuthController from "../controllers/AuthController";

const authController = new AuthController();

router.post("/login", authController.loginUser);

router.post("/signup", authController.signupUser);

router.post("/signup/verify", authController.verifyEmail);

router.post("/password/forgot", authController.forgotPassword);

router.post("/password/reset", authController.resetPassword);

export default router;

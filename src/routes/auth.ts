import { Router } from "express";
const router = Router();

import UserAuthController from "../controllers/UserAuthController";
import AdminAuthController from "../controllers/AdminAuthController";

const userAuthController = new UserAuthController();
const adminAuthController = new AdminAuthController();

router.post("/user/login", userAuthController.loginUser);

router.post("/user/signup", userAuthController.signupUser);

router.post("/user/signup/verify", userAuthController.verifyEmail);

router.post("/user/password/forgot", userAuthController.forgotPassword);

router.post("/user/password/reset", userAuthController.resetPassword);

router.post("/admin/login", adminAuthController.loginAdmin);

router.post("/admin/signup", adminAuthController.signupAdmin);

router.post("/admin/signup/verify", adminAuthController.verifyEmail);

router.post("/admin/password/forgot", adminAuthController.forgotPassword);

router.post("/admin/password/reset", adminAuthController.resetPassword);

export default router;

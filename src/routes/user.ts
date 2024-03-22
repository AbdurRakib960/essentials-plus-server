import { Router } from "express";
import UserController from "../controllers/UserController";
const router = Router();

const userController = new UserController();

router.put("/:id", userController.updateUser);

router.patch("/:id/password", userController.updatePassword);

router.get("/", userController.getUsers);

export default router;

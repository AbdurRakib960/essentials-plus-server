import { Router } from "express";
import authRoutes from "./auth";
import userRoutes from "./user";
import mealRoutes from "./meal";
import paymentRoutes from "./payment";
import planRoutes from "./plan";

const router = Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/meal", mealRoutes);
router.use("/payment", paymentRoutes);
router.use("/plan", planRoutes);

export default router;

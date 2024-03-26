import { Router } from "express";
import PlanController from "../controllers/PlanController";

const router = Router();

const planController = new PlanController();

router.post("/", planController.createPlan);

export default router;

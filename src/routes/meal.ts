import { Router } from "express";
import MealController from "../controllers/MealController";

const router = Router();

const mealController = new MealController();

router.post("/", mealController.createMeal);

router.post("/ingredient", mealController.createIngredient);

router.put("/:id", mealController.updateMeal);

router.put("/ingredient/:id", mealController.updateIngredient);

router.delete("/:id", mealController.deleteMeal);

router.delete("/ingredient/:id", mealController.deleteIngredient);

router.get("/", mealController.getMeals);

router.get("/ingredient", mealController.getIngredients);

export default router;

import { z } from "zod";
import ErrorConfig from "../utils/ErrorConfig";
import { MealType } from "@prisma/client";

class MealValidator {
  private errMsg = new ErrorConfig.ErrorMessage();

  private required_string = z.string(this.errMsg.default_string_error).min(1, this.errMsg.minimum_error);

  preparationMethod = z.object({
    label: this.required_string,
  });

  tips = z.object({
    label: this.required_string,
  });

  ingredient = z.object({
    name: this.required_string,
    quantity: z.number().positive(),
    unit: this.required_string,
    kcal: z.number(),
    proteins: z.number(),
    carbohydrates: z.number(),
    fats: z.number(),
    fiber: z.number(),
  });

  meal = z.object({
    meal: z.nativeEnum(MealType),
    mealNumber: this.required_string,
    mealName: this.required_string,
    preparationMethod: z.array(this.preparationMethod),
    cookingTime: this.required_string,
    tips: z.array(this.tips),
    image: this.required_string,
    ingredients: z.array(this.ingredient.partial().extend({ id: z.string() })).optional(),
  });

  updateMeal = this.meal.partial().extend({
    id: z.string().optional(),
    ingredients: z.array(this.ingredient.partial().extend({ id: z.string() })).optional(),
    tips: z.array(this.tips.extend({ id: z.string().optional() })).optional(),
    preparationMethod: z.array(this.preparationMethod.extend({ id: z.string().optional() })).optional(),
  });

  updateIngredient = this.ingredient.partial().extend({ id: z.string().optional() });
}

export default MealValidator;

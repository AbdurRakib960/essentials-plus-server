import { z } from "zod";
import MealValidator from "./MealValidator";
import ErrorConfig from "../utils/ErrorConfig";

class PlanValidator {
  private mealsValidator = new MealValidator();

  private errMsg = new ErrorConfig.ErrorMessage();

  private required_string = z.string(this.errMsg.default_string_error).min(1, this.errMsg.minimum_error);

  createPlan = z.object({
    userId: this.required_string,
    numberOfDays: z.number(),
    mealsPerDay: z.number(),
    totalKcal: z.number(),
    price: z.number(),
    mealsForTheWeek: z
      .array(
        z.object({
          id: z.string().optional(),
          day: z.number(),
          meals: z.array(this.mealsValidator.updateMeal),
        }),
      )
      .optional(),
  });

  updatePlan = this.createPlan.partial();
}

export default PlanValidator;

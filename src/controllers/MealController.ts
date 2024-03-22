import { RequestHandler } from "express";
import { prisma } from "../configs/database";
import MealValidator from "../validators/MealValidator";
import BaseValidator from "../validators/BaseValidator";

class MealController {
  private validators = new MealValidator();

  // @GET="/"
  getMeals: RequestHandler = async (req, res) => {
    const meals = await prisma.meal.findMany({
      include: {
        ingredients: true,
        tips: true,
        preparationMethod: true,
      },
    });
    res.status(200).send(meals);
  };

  // @POST="/"
  createMeal: RequestHandler = async (req, res) => {
    const val = await this.validators.meal.parseAsync(req.body);

    const meal = await prisma.meal.create({
      data: {
        ...val,
        ingredients: {
          create: val.ingredients?.map((v) => ({ ingredientId: v.id })),
        },
        preparationMethod: {
          create: val.preparationMethod,
        },
        tips: {
          create: val.tips,
        },
      },
      include: {
        ingredients: true,
        tips: true,
        preparationMethod: true,
      },
    });

    res.status(200).send({ message: "Meal created", meal });
  };

  // @PUT="/:id"
  updateMeal: RequestHandler = async (req, res) => {
    const id = await new BaseValidator().validateUUID.parseAsync(req.params.id);
    const { ingredients, tips, preparationMethod, ...value } = await this.validators.updateMeal.parseAsync(req.body);

    const meal = await prisma.meal.update({
      where: { id },
      data: {
        ...value,
        ingredients: {
          create: ingredients?.map((v) => ({ ingredientId: v.id })),
        },
        tips: {
          connectOrCreate: tips.map((v) => ({ where: { id: v?.id || "" }, create: v })),
        },
        preparationMethod: {
          connectOrCreate: preparationMethod.map((v) => ({ where: { id: v?.id || "" }, create: v })),
        },
      },
    });

    res.status(200).send({ message: "Meal updated", meal });
  };

  // @GET="/ingregient"
  getIngredients: RequestHandler = async (req, res) => {
    const ingredients = await prisma.ingredient.findMany();
    res.status(200).send(ingredients);
  };

  // @POST="/ingregient"
  createIngredient: RequestHandler = async (req, res) => {
    const value = await this.validators.ingredient.parseAsync(req.body);
    const ingredient = await prisma.ingredient.create({ data: value });

    res.status(200).send({ message: "Ingredient created", ingredient });
  };

  // @PUT="/ingregient/:id"
  updateIngredient: RequestHandler = async (req, res) => {
    const id = await new BaseValidator().validateUUID.parseAsync(req.params.id);
    const value = await this.validators.updateIngredient.parseAsync(req.body);
    const ingredient = await prisma.ingredient.update({ where: { id }, data: { ...value } });
    res.status(200).send({ message: "Ingredient updated", ingredient });
  };

  // @DELETE="/:id"
  deleteMeal: RequestHandler = async (req, res) => {
    const { id } = req.params;
    if (!id) throw new Error("Required id not found");

    const meal = await prisma.meal.delete({ where: { id } });

    res.status(200).send({ message: "Meal deleted", meal });
  };
}

export default MealController;

import { RequestHandler } from "express";
import PlanValidator from "../validators/PlanValidator";
import { prisma } from "../configs/database";
import BaseValidator from "../validators/BaseValidator";

class PlanController {
  private validators = new PlanValidator();

  createPlan: RequestHandler = async (req, res) => {
    const { userId, mealsForTheWeek, ...value } = await this.validators.createPlan.parseAsync(req.body);

    const plan = await prisma.plan.create({
      data: {
        ...value,
        user: { connect: { id: userId } },
        mealsForTheWeek: {
          create: mealsForTheWeek?.map((v) => ({ day: v.day, meals: { connect: v.meals.map((m) => ({ id: m.id })) } })),
        },
      },
    });

    res.status(200).send({ message: "Plan created", plan });
  };

  updatePlan: RequestHandler = async (req, res) => {
    const id = await new BaseValidator().validateUUID.parseAsync(req.params.id);

    const { mealsForTheWeek, ...value } = await this.validators.updatePlan.parseAsync(req.body);

    const plan = await prisma.plan.update({
      where: { id },
      data: Object.assign(
        {
          ...value,
        },
        mealsForTheWeek && {
          mealsForTheWeek: {
            deleteMany: {},
            create: mealsForTheWeek?.map((v) => ({ day: v.day, meals: { connect: v.meals.map((m) => ({ id: m.id })) } })),
          },
        },
      ),
    });

    res.status(200).send({
      message: "Plan updated",
      plan,
    });
  };
}

export default PlanController;

import { RequestHandler } from "express";
import UserValidator from "../validators/UserValidator";
import { prisma } from "../configs/database";
import { compare, hash } from "bcrypt";
import Utils from "../utils";
import BaseValidator from "../validators/BaseValidator";

class UserController {
  private validators = new UserValidator();

  // @PUT="/:id" // ✔️ checked
  updateUser: RequestHandler = async (req, res) => {
    const id = await new BaseValidator().validateUUID.parseAsync(req.params.id);
    const value = await this.validators.updateUser.parseAsync(req.body);
    console.log(id, value);
    const user = await prisma.user.update({ where: { id: id || value.id }, data: value, select: Utils.prismaExclude("User", ["password"]) });

    if (!user) throw new Error("User not found with this id");

    res.status(200).send({ message: "User Updated", user });
  };

  // @GET="/" @Note: AdminRoute
  getUsers: RequestHandler = async (req, res) => {
    const users = await prisma.user.findMany({ select: Utils.prismaExclude("User", ["password"]) });
    res.status(200).send(users);
  };

  // @PATCH="/:id/password"
  updatePassword: RequestHandler = async (req, res) => {
    const id = await new BaseValidator().validateUUID.parseAsync(req.params.id);
    const value = await this.validators.updatePassword.parseAsync(req.body);

    const findUser = await prisma.user.findUnique({ where: { id } });
    if (!findUser) throw new Error("User not found with this id");

    const matchCurrent = await compare(value.currentPassword, findUser.password);

    if (!matchCurrent) throw new Error("Current Password not valid");

    if (value.newPassword != value.confirmPassword) throw new Error("Password not match");

    const hashPassword = await hash(value.newPassword, 10);

    const user = await prisma.user.update({ where: { id }, data: { password: hashPassword }, select: Utils.prismaExclude("User", ["password"]) });

    res.status(200).send({ message: "Password updated", user });
  };
}

export default UserController;

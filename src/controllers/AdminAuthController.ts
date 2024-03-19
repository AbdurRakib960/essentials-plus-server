import { RequestHandler } from "express";
import Hash from "../utils/Hash";
import sender from "../utils/sender";
import { prisma } from "../configs/database";
import jwt from "jsonwebtoken";
import AuthValidator from "../validators/AuthValidator";

class AdminAuthController {
  private JWT_SECRET = process.env.JWT_SECRET || "";

  private validators = new AuthValidator();

  // @POST="/admin/login" // ✔️ checked
  loginAdmin: RequestHandler = async (req, res) => {
    // validate
    const value = await this.validators.login.parseAsync(req.body);

    // check newAdmin
    const admin = await prisma.admin.findUnique({ where: { email: value.email } });
    if (!admin) throw new Error("admin not exist");

    // check password
    const isMatch = await Hash._matchPassword(value.password, admin.password);
    if (!isMatch) throw new Error("Invalid credential");

    if (!admin.verified) {
      throw new Error("Your account isn't verified yet, Please verify");
    }
    const hash = jwt.sign({ id: admin.id, name: admin.name, email: admin.email }, this.JWT_SECRET);

    res.status(200).send({
      hash,
      message: "logged in successfully",
    });
  };

  // @POST="/admin/password/forgot" // ✔️ checked
  forgotPassword: RequestHandler = async (req, res) => {
    const { email } = await this.validators.forgotPassword.parseAsync(req.body);

    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) throw new Error("No admin found with this email");

    if (!admin.verified) throw new Error("admin is not verified");

    const hash = Hash.encryptData({
      id: admin.id,
      email: admin.email,
    });

    let resendToken = await prisma.token.findFirst({ where: { data: hash, type: "ResetPassword" } });

    if (resendToken) {
      const isMinute = new Date().getTime() - new Date(resendToken.updatedAt).getTime() < 60000;
      if (isMinute) {
        throw new Error("Can't resend email within one minute");
      }
      await prisma.token.update({ where: { token: resendToken.token }, data: { token: resendToken.token } });
    } else {
      resendToken = await prisma.token.create({ data: { token: Hash.randomString(), data: hash, type: "ResetPassword" } });
    }

    const passwordResetLink = `${process.env.CLIENT_URL}/signin/password/reset/${resendToken.token}`;

    // Send Reset Password Mail
    sender.send({
      message: {
        to: email,
      },
      template: "reset_password",
      locals: {
        url: passwordResetLink,
      },
    });

    const encrypt = Hash.encryptData({ email });

    res.status(200).send({
      message: "Password reset email send successfully, Please check your email",
      hash: encrypt,
      token: resendToken.token,
    });
  };

  // @POST="/admin/password/reset" // ✔️ checked
  resetPassword: RequestHandler = async (req, res) => {
    const { password, token } = await this.validators.resetPassword.parseAsync(req.body);

    // Check if the provided token exists in the database
    const checkToken = await prisma.token.findUnique({ where: { token, type: "ResetPassword" } });
    if (!checkToken) throw new Error("Invalid token");

    // Hash the new password
    const hashPassword = await Hash._hashPassword(password);

    const data = Hash.decryptData(checkToken.data);

    // Update the admin's password using the hashed password
    await prisma.admin.update({ where: { id: data.id }, data: { password: hashPassword } });
    await prisma.token.delete({ where: { token: token } });

    // Respond with a success message
    res.status(200).send({
      message: "Password reset successfully",
    });
  };

  // @POST="/admin/email/resend" // ✔️ checked
  resendEmail: RequestHandler = async (req, res) => {
    const { token: t, type } = await this.validators.resendEmail.parseAsync(req.body);

    const token = await prisma.token.findUnique({ where: { token: t, type } });

    if (!token) throw new Error("Token not valid");

    if (token.type !== type) {
      throw new Error("Token not valid");
    }

    const data = Hash.decryptData(token.data);

    const admin = await prisma.admin.findUnique({ where: { id: data.id } });

    if (!admin) throw new Error("Admin not exist");

    if (type == "ConfirmEmail") {
      if (admin.verified) throw new Error("Admin already verified");
    }

    const isMinute = new Date().getTime() - new Date(token.updatedAt).getTime() < 60000;
    if (isMinute) {
      throw new Error("Can't resend email within one minute");
    }

    const authToken = await prisma.token.update({ data: { token: Hash.randomString() }, where: { type, token: token.token } });

    if (!authToken) throw new Error("Token not valid");

    const resendEmailLink = {
      ResetPassword: `${process.env.CLIENT_URL}/reset-password/${authToken.token}`,
      ConfirmEmail: `${process.env.CLIENT_URL}/signup/verify/${authToken.token}`,
    }[type];

    // Resend email
    sender.send({
      message: {
        to: admin.email,
      },
      template: {
        ResetPassword: "reset_password",
        ConfirmEmail: "confirm_email",
      }[type],
      locals: {
        url: resendEmailLink,
      },
    });

    res.status(200).send({
      message: "Email resend successfully, Please check your email",
    });
  };
}

export default AdminAuthController;

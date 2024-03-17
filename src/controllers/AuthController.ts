import { RequestHandler } from "express";
import Validators from "../utils/Validators";
import Hash from "../utils/Hash";
import sender from "../utils/sender";
import rswitch from "rswitch";
import { prisma } from "../configs/database";

class AuthController {
  // @POST="/login" // ✔️ checked
  loginUser: RequestHandler = async (req, res) => {
    // validate
    const value = await Validators.loginUser.validateAsync(req.body);

    // check user
    const user = await prisma.user.findUnique({ where: { email: value.email } });
    if (!user) throw new Error("User not exist");

    // check password
    const isMatch = await Hash._matchPassword(value.password, user.password);
    if (!isMatch) throw new Error("Invalid credential");

    if (!user.verified) {
      throw new Error("Your account isn't verified yet, Please verify");
    }
    const hash = Hash.encryptData({ id: user.id, name: user.name, email: user.email });

    res.status(200).send({
      hash,
      message: "logged in successfully",
    });
  };

  // @POST="/signup" // ✔️ checked
  signupUser: RequestHandler = async (req, res) => {
    const value = await Validators.signupUser.validateAsync(req.body);

    const user = await prisma.user.findUnique({ where: { email: value.email } });

    if (user) throw new Error("User already exist");

    const hashPassword = await Hash._hashPassword(value.password);

    const newUser = await prisma.user.create({
      data: {
        ...value,
        password: hashPassword,
      },
    });

    const token = await prisma.token.create({
      data: {
        data: Hash.encryptData({
          id: newUser.id,
          email: newUser.email,
        }),
        type: "ConfirmEmail",
        token: Hash.randomString(),
      },
    });

    const confirmEmailUrl = `${process.env.CLIENT_URL}/signup/verify/${token.token}`;

    sender.send({
      message: {
        to: value.email,
      },
      template: "confirm_email",
      locals: {
        url: confirmEmailUrl,
      },
    });

    const encrypt = Hash.encryptData({
      email: value.email,
    });

    res.status(201).send({
      message: "User created successfully",
      hash: encrypt,
      token: token.token,
    });
  };

  // @POST="/signup/verify" // ✔️ checked
  verifyEmail: RequestHandler = async (req, res) => {
    const { token } = await Validators.verifyEmail.validateAsync(req.body);

    const findToken = await prisma.token.findUnique({ where: { token, type: "ConfirmEmail" } });

    const data = Hash.decryptData(findToken?.data);

    if (!findToken || !data) throw new Error("Invalid link");

    const user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user) throw new Error("Invalid link");

    await prisma.user.update({ where: { id: Number(data.id) }, data: { verified: true } });
    await prisma.token.delete({ where: { token: findToken.token } });

    res.status(200).send({ message: "Email verified successfully" });
  };

  // @POST="/password/forgot" // ✔️ checked
  forgotPassword: RequestHandler = async (req, res) => {
    const { email } = await Validators.forgotPassword.validateAsync(req.body);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw new Error("No user found with this email");

    if (!user.verified) throw new Error("User is not verified");

    const hash = Hash.encryptData({
      id: user.id,
      email: user.email,
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

  // @POST="/password/reset" // ✔️ checked
  resetPassword: RequestHandler = async (req, res) => {
    const { password, token } = await Validators.resetPassword.validateAsync(req.body);

    // Check if the provided token exists in the database
    const checkToken = await prisma.token.findUnique({ where: { token, type: "ResetPassword" } });
    if (!checkToken) throw new Error("Invalid token");

    // Hash the new password
    const hashPassword = await Hash._hashPassword(password);

    const data = Hash.decryptData(checkToken.data);

    // Update the user's password using the hashed password
    await prisma.user.update({ where: { id: Number(data.id) }, data: { password: hashPassword } });
    await prisma.token.delete({ where: { token: token } });

    // Respond with a success message
    res.status(200).send({
      message: "Password reset successfully",
    });
  };

  // @POST="/email/resend" // ✔️ checked
  resendEmail: RequestHandler = async (req, res) => {
    const { token: t, type } = await Validators.resendEmail.validateAsync(req.body);

    const token = await prisma.token.findUnique({ where: { token: t, type } });

    if (!token) throw new Error("Token not valid");

    if (token.type !== type) {
      throw new Error("Token not valid");
    }

    const data = Hash.decryptData(token.data);

    const user = await prisma.user.findUnique({ where: { id: Number(data.id) } });

    if (!user) throw new Error("User not exist");

    if (type == "ConfirmEmail") {
      if (user.verified) throw new Error("User already verified");
    }

    const isMinute = new Date().getTime() - new Date(token.updatedAt).getTime() < 60000;
    if (isMinute) {
      throw new Error("Can't resend email within one minute");
    }

    const authToken = await prisma.token.update({ data: { token: Hash.randomString() }, where: { type, token: token.token } });

    if (!authToken) throw new Error("Token not valid");

    const resendEmailLink = rswitch(type, {
      ResetPassword: `${process.env.CLIENT_URL}/reset-password/${authToken.token}`,
      ConfirmEmail: `${process.env.CLIENT_URL}/signup/verify/${authToken.token}`,
    });

    // Resend email
    sender.send({
      message: {
        to: user.email,
      },
      template: rswitch(type, {
        ResetPassword: "reset_password",
        ConfirmEmail: "confirm_email",
      }),
      locals: {
        url: resendEmailLink,
      },
    });

    res.status(200).send({
      message: "Email resend successfully, Please check your email",
    });
  };
}

export default AuthController;

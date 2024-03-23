import z from "zod";
import { TokenType } from "@prisma/client";
import ErrorConfig from "../utils/ErrorConfig";

class AuthValidator {
  private errMsg = new ErrorConfig.ErrorMessage();

  private required_string = z.string(this.errMsg.default_string_error).min(1, this.errMsg.minimum_error);

  login = z.object({
    email: this.required_string.email().trim().toLowerCase(),
    password: this.required_string,
  });

  signup = z.object({
    name: this.required_string.min(1, this.errMsg.minimum_error),
    email: this.required_string.email().trim().toLowerCase(),
    password: this.required_string.min(8, this.errMsg.minimum_error),
  });

  forgotPassword = z.object({
    email: this.required_string.email().trim().toLowerCase(),
  });

  resetPassword = z
    .object({
      token: this.required_string,
      password: this.required_string.min(8, this.errMsg.minimum_password_error),
      confirmPassword: this.required_string.min(8, this.errMsg.minimum_password_error),
    })
    .refine((data) => data.password == data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });

  resendEmail = z.object({
    token: this.required_string,
    type: z.nativeEnum(TokenType),
  });

  verifyEmail = z.object({
    token: this.required_string,
  });
}

export default AuthValidator;

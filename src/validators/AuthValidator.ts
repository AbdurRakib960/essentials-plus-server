import z from "zod";
import ErrorMessage from "../utils/ErrorMessage";
import { TokenType } from "@prisma/client";

class AuthValidator {
  private errMsg: ErrorMessage = new ErrorMessage();

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

  resetPassword = z.object({
    token: this.required_string,
    password: this.required_string.min(8, this.errMsg.minimum_password_error),
    confirmPassword: this.required_string.min(8, this.errMsg.minimum_password_error),
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

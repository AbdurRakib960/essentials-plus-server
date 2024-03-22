import { Gender, UserStatus } from "@prisma/client";
import { z } from "zod";
import ErrorConfig from "../utils/ErrorConfig";

class UserValidator {
  private errMsg = new ErrorConfig.ErrorMessage();

  private required_string = z.string(this.errMsg.default_string_error).min(1, this.errMsg.minimum_error);

  updateUser = z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    profile: z.string().optional(),
    surname: z.string().optional(),
    age: z.number().positive().optional(),
    gender: z.nativeEnum(Gender).optional(),
    weight: z.number().positive().optional(),
    height: z.number().positive().optional(),
    kcal: z.number().positive().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    mobile: z.string().optional(),
    email: z.string().optional(),
    nr: z.string().optional(),
    zipCode: z.string().optional(),
    activityLevel: z.string().optional(),
    goal: z.string().optional(),
    status: z.nativeEnum(UserStatus).optional(),
  });

  updatePassword = z
    .object({
      currentPassword: this.required_string.min(8, this.errMsg.minimum_password_error),
      newPassword: this.required_string.min(8, this.errMsg.minimum_password_error),
      confirmPassword: this.required_string.min(8, this.errMsg.minimum_password_error),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });
}

export default UserValidator;

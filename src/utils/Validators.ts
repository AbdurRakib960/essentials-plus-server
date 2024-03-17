import joi from "joi";

class Validators {
  // auth validators

  static loginUser = joi.object({
    email: joi.string().email().required().label("Email").trim().lowercase(),
    password: joi.string().required().label("Password"),
  });

  static signupUser = joi.object({
    name: joi.string().required().label("Name"),
    email: joi.string().email().required().label("Email"),
    password: joi.string().required().label("Password"),
  });

  static forgotPassword = joi.object({
    email: joi.string().email().required().label("Email").trim().lowercase(),
  });

  static resetPassword = joi.object({
    token: joi.string().required().label("Token"),
    password: joi.string().required().label("Password"),
    confirmPassword: joi
      .string()
      .equal(joi.ref("password"))
      .required()
      .label("Confirm Passowrd")
      .messages({ "any.only": "{{#label}} does not match" }),
  });

  static resendEmail = joi.object({
    token: joi.string().required().label("Token"),
    // email: joi.string().email().required().label("Email").trim().lowercase(),
    type: joi.string().required().valid("ConfirmEmail", "ResetPassword"),
  });

  static verifyEmail = joi.object({
    token: joi.string().required().label("Verify Token"),
  });
}

export default Validators;

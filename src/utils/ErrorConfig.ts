// Define your custom error class

import { ErrorRequestHandler } from "express";
import * as z from "zod";

class ErrorConfig {
  static normalizeZodError(errors: z.ZodError): { field: string; message: string }[] {
    return errors.errors.map((error) => ({
      field: error.path.join("."),
      message: `${error.path.join(".")} ${error.message}`,
    }));
  }

  static ErrorMessage = class {
    invalid_type_error = "Invalid type provided for this field";
    required_error = "cannot be blank";
    minimum_error = "is too short";
    minimum_password_error = "must be 8 character";
    default_string_error = { invalid_type_error: this.invalid_type_error, required_error: this.required_error };
  };

  static ErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (err) {
      if (err instanceof z.ZodError) {
        const newError = ErrorConfig.normalizeZodError(err);
        return res.status(400).send({ message: newError[0].message, issues: newError });
      } else {
        return res.status(400).send({ message: err.message, issues: [] });
      }
    }
    next();
  };
}

export default ErrorConfig;

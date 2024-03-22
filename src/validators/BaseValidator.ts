import { z } from "zod";
import ErrorConfig from "../utils/ErrorConfig";

class BaseValidator {
  private UUIDv4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  private errMsg = new ErrorConfig.ErrorMessage();

  validateUUID = z.string(this.errMsg.default_string_error).regex(this.UUIDv4Regex, "Invalid uuid format");
}

export default BaseValidator;

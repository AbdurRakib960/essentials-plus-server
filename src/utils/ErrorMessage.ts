class ErrorMessage {
  invalid_type_error = "Invalid type provided for this field";
  required_error = "This field cannot be blank";
  minimum_error = "Value is too short";
  minimum_password_error = "Password must be 8 character";
  default_string_error = { invalid_type_error: this.invalid_type_error, required_error: this.required_error };
}

export default ErrorMessage;

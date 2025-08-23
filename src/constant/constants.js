'use strict';

export const SUCCESS = {
  OK: {
    code: 200,
    message: "Success",
  },
  CREATED: {
    code: 201,
    message: "Resource created successfully",
  },
  UPDATED: {
    code: 200,
    message: "Resource updated successfully",
  },
  DELETED: {
    code: 200,
    message: "Resource deleted successfully",
  },
  LOGIN_SUCCESS: {
    code: 200,
    message: "Login successful",
  },
  LOGOUT_SUCCESS: {
    code: 200,
    message: "Logout successful",
  }
};

export const ERROR = {
  BAD_REQUEST: {
    code: 400,
    message: "Bad request",
  },
  UNAUTHORIZED: {
    code: 401,
    message: "Unauthorized access",
  },
  FORBIDDEN: {
    code: 403,
    message: "Forbidden",
  },
  NOT_FOUND: {
    code: 404,
    message: "Resource not found",
  },
  CONFLICT: {
    code: 409,
    message: "Conflict",
  },
  SERVER_ERROR: {
    code: 500,
    message: "Internal server error",
  },
  INVALID_CREDENTIALS: {
    code: 401,
    message: "Invalid username or password",
  },
  USERNAME_TAKEN: {
    code: 409,
    message: "Username already taken",
  },
  EMAIL_TAKEN: {
    code: 409,
    message: "Email already taken",
  }
};

export const VALIDATION_MESSAGES = {
  USER: {
    USERNAME_REQUIRED: "Username is required",
    USERNAME_MIN: "Username must be at least 3 characters long",
    USERNAME_MAX: "Username must not exceed 50 characters",
    EMAIL_REQUIRED: "Email is required",
    EMAIL_INVALID: "Please provide a valid email address",
    PASSWORD_REQUIRED: "Password is required",
    PASSWORD_MIN: "Password must be at least 6 characters long",
    PASSWORD_MAX: "Password must not exceed 100 characters",
    USER_TYPE_REQUIRED: "User type is required",
    USER_TYPE_INVALID: "Invalid user type",
    STATUS_INVALID: "Status must be either ACTIVE or INACTIVE",
  },
  CUSTOMER: {
    NAME_REQUIRED: "Customer name is required",
    EMAIL_REQUIRED: "Customer email is required",
    EMAIL_INVALID: "Customer email must be valid",
  },
  AUTH: {
    INVALID_CREDENTIALS: "Invalid username or password",
    TOKEN_REQUIRED: "Authentication token is required",
    TOKEN_INVALID: "Invalid authentication token",
  },
  COMMON: {
    ID_REQUIRED: "ID is required",
    ID_INVALID: "ID must be a valid number",
    REQUIRED_FIELD: "This field is required",
    INVALID_INPUT: "Invalid input",
  },
};

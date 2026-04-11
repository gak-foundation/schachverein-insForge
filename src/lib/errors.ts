export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public isOperational: boolean = true,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class AuthError extends AppError {
  constructor(message: string, code: string = "AUTH_ERROR") {
    super(message, 401, code);
    this.name = "AuthError";
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Zu viele Anfragen") {
    super(message, 429, "RATE_LIMITED");
    this.name = "RateLimitError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code: string = "VALIDATION_ERROR") {
    super(message, 400, code);
    this.name = "ValidationError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Zugriff verweigert", code: string = "FORBIDDEN") {
    super(message, 403, code);
    this.name = "ForbiddenError";
  }
}

const CLIENT_SAFE_CODES = new Set([
  "AUTH_INVALID_CREDENTIALS",
  "AUTH_EMAIL_NOT_VERIFIED",
  "AUTH_ACCOUNT_LOCKED",
  "RATE_LIMITED",
  "VALIDATION_ERROR",
  "FORBIDDEN",
  "TOKEN_EXPIRED",
  "TOKEN_INVALID",
  "TOKEN_REVOKED",
  "REFRESH_TOKEN_COMPROMISED",
]);

export function handleError(error: unknown): {
  message: string;
  code: string;
  statusCode: number;
} {
  if (error instanceof AppError) {
    if (error.isOperational && CLIENT_SAFE_CODES.has(error.code)) {
      return {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      };
    }
    return {
      message: "Ein Fehler ist aufgetreten",
      code: "INTERNAL_ERROR",
      statusCode: error.statusCode,
    };
  }

  if (error instanceof Error) {
    console.error("[AppError]", error.message, error.stack);
  } else {
    console.error("[AppError] Unknown error:", error);
  }

  return {
    message: "Ein Fehler ist aufgetreten",
    code: "INTERNAL_ERROR",
    statusCode: 500,
  };
}
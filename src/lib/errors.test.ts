import { describe, it, expect } from "vitest";
import {
  AppError,
  AuthError,
  RateLimitError,
  ValidationError,
  ForbiddenError,
  handleError,
} from "./errors";

describe("AppError", () => {
  it("sollte einen AppError mit allen Eigenschaften erstellen", () => {
    const error = new AppError("Testfehler", 400, "TEST_ERROR");

    expect(error.message).toBe("Testfehler");
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("TEST_ERROR");
    expect(error.isOperational).toBe(true);
    expect(error.name).toBe("AppError");
  });

  it("sollte isOperational auf false setzen", () => {
    const error = new AppError("Test", 500, "ERR", false);
    expect(error.isOperational).toBe(false);
  });

  it("sollte eine Error-Instanz sein", () => {
    const error = new AppError("Test", 500, "ERR");
    expect(error).toBeInstanceOf(Error);
  });
});

describe("AuthError", () => {
  it("sollte mit Standardwerten erstellt werden", () => {
    const error = new AuthError("Nicht autorisiert");

    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe("AUTH_ERROR");
    expect(error.message).toBe("Nicht autorisiert");
  });

  it("sollte benutzerdefinierten Code akzeptieren", () => {
    const error = new AuthError("Token abgelaufen", "TOKEN_EXPIRED");
    expect(error.code).toBe("TOKEN_EXPIRED");
  });
});

describe("RateLimitError", () => {
  it("sollte mit Standardwerten erstellt werden", () => {
    const error = new RateLimitError();

    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(429);
    expect(error.code).toBe("RATE_LIMITED");
    expect(error.message).toBe("Zu viele Anfragen");
  });
});

describe("ValidationError", () => {
  it("sollte mit Standardwerten erstellt werden", () => {
    const error = new ValidationError("Ungültige Eingabe");

    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("VALIDATION_ERROR");
  });
});

describe("ForbiddenError", () => {
  it("sollte mit Standardwerten erstellt werden", () => {
    const error = new ForbiddenError();

    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe("FORBIDDEN");
    expect(error.message).toBe("Zugriff verweigert");
  });
});

describe("handleError", () => {
  it("sollte AppError mit client-sicherem Code durchreichen", () => {
    const error = new ValidationError("E-Mail ist erforderlich");
    const result = handleError(error);

    expect(result).toEqual({
      message: "E-Mail ist erforderlich",
      code: "VALIDATION_ERROR",
      statusCode: 400,
    });
  });

  it("sollte AuthError mit AUTH_INVALID_CREDENTIALS durchreichen", () => {
    const error = new AuthError("Falsche Anmeldedaten", "AUTH_INVALID_CREDENTIALS");
    const result = handleError(error);

    expect(result.code).toBe("AUTH_INVALID_CREDENTIALS");
    expect(result.statusCode).toBe(401);
  });

  it("sollte RateLimitError durchreichen", () => {
    const error = new RateLimitError();
    const result = handleError(error);

    expect(result.code).toBe("RATE_LIMITED");
    expect(result.statusCode).toBe(429);
  });

  it("sollte AppError ohne client-sicheren Code verstecken", () => {
    const error = new AppError("Interner DB-Fehler", 500, "DB_CONNECTION_FAILED", true);
    const result = handleError(error);

    expect(result.message).toBe("Ein Fehler ist aufgetreten");
    expect(result.code).toBe("INTERNAL_ERROR");
    expect(result.statusCode).toBe(500);
  });

  it("sollte nicht-operationale Fehler verstecken", () => {
    const error = new AppError("Kritisch", 500, "CRITICAL", false);
    const result = handleError(error);

    expect(result.message).toBe("Ein Fehler ist aufgetreten");
    expect(result.code).toBe("INTERNAL_ERROR");
  });

  it("sollte ForbiddenError durchreichen", () => {
    const error = new ForbiddenError();
    const result = handleError(error);

    expect(result.code).toBe("FORBIDDEN");
    expect(result.statusCode).toBe(403);
  });

  it("sollte Standard-Fehler (Error) verstecken", () => {
    const error = new Error("Netzwerkfehler");
    const result = handleError(error);

    expect(result.message).toBe("Ein Fehler ist aufgetreten");
    expect(result.code).toBe("INTERNAL_ERROR");
    expect(result.statusCode).toBe(500);
  });

  it("sollte unbekannte Fehler verstecken", () => {
    const result = handleError("irgendwas");

    expect(result.message).toBe("Ein Fehler ist aufgetreten");
    expect(result.code).toBe("INTERNAL_ERROR");
    expect(result.statusCode).toBe(500);
  });

  it("sollte null graceful behandeln", () => {
    const result = handleError(null);

    expect(result.message).toBe("Ein Fehler ist aufgetreten");
    expect(result.code).toBe("INTERNAL_ERROR");
  });

  it("sollte Token_EXPIRED durchreichen", () => {
    const error = new AuthError("Token abgelaufen", "TOKEN_EXPIRED");
    const result = handleError(error);

    expect(result.code).toBe("TOKEN_EXPIRED");
    expect(result.statusCode).toBe(401);
    expect(result.message).toBe("Token abgelaufen");
  });
});

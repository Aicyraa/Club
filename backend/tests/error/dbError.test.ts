import { describe, it, expect } from "vitest";
import { mapPgError, DbError } from "../../src/error/dbError";

describe("mapPgError", () => {
  it("maps a unique violation (23505) to 409 with constraint details", () => {
    const err = mapPgError({
      code: "23505",
      constraint: "users_email_key",
      detail: "Key (email)=(user@example.com) already exists.",
      table: "users",
    });

    expect(err).toBeInstanceOf(DbError);
    expect(err.statusCode).toBe(409);
    expect(err.message).toBe("A record with this value already exists.");
    expect(err.code).toBe("23505");
    expect(err.constraint).toBe("users_email_key");
    expect(err.detail).toBe("Key (email)=(user@example.com) already exists.");
    expect(err.table).toBe("users");
  });

  it("maps a not-null violation (23502) to 400", () => {
    const err = mapPgError({ code: "23502", column: "username" });

    expect(err.statusCode).toBe(400);
    expect(err.message).toBe("A required field is missing.");
    expect(err.isOperational).toBe(true);
  });

  it("maps a check violation (23514) to 400", () => {
    const err = mapPgError({ code: "23514", constraint: "password_length" });

    expect(err.statusCode).toBe(400);
    expect(err.message).toBe("Value violates a database constraint.");
  });

  it("maps a connection failure (57P03) to 503", () => {
    const err = mapPgError({ code: "57P03" });

    expect(err.statusCode).toBe(503);
    expect(err.message).toBe("Database is temporarily unavailable.");
  });

  it("maps an undefined table (42P01) to a generic 500", () => {
    const err = mapPgError({ code: "42P01", table: "missing_table" });

    expect(err.statusCode).toBe(500);
    expect(err.message).toBe("Database query failed.");
    expect(err.table).toBe("missing_table");
  });

  it("maps an unknown pg code to a 500 keeping the original message", () => {
    const err = mapPgError({ code: "XY000", message: "some weird failure" });

    expect(err.statusCode).toBe(500);
    expect(err.message).toBe("some weird failure");
  });

  it("maps a non-pg error to a 500 with its own message", () => {
    const err = mapPgError(new Error("pool is down"));

    expect(err).toBeInstanceOf(DbError);
    expect(err.statusCode).toBe(500);
    expect(err.message).toBe("pool is down");
  });
});

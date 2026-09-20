import { describe, it, expect, vi, afterEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { errorHandler } from "../../src/middlewares/errorHandler";
import { DbError } from "../../src/error/dbError";

const makeRes = () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response;
  return res;
};

const makeReq = () => ({}) as Request;
const next = (() => {}) as NextFunction;

afterEach(() => {
  delete process.env.ENVIRONMENT;
});

describe("errorHandler", () => {
  it("responds with a generic message for a 5xx error in production", () => {
    process.env.ENVIRONMENT = "PROD";
    const res = makeRes();
    const err = new DbError("A record with this value already exists.", 500, {
      code: "23505",
      constraint: "users_email_key",
      detail: "Key (email) already exists.",
      table: "users",
    });

    errorHandler(err as never, makeReq(), res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        statusCode: 500,
        message: "Internal Server Error!",
      },
    });
  });

  it("shows the mapped message for a 4xx error in production", () => {
    process.env.ENVIRONMENT = "PROD";
    const res = makeRes();
    const err = new DbError("A record with this value already exists.", 409, {
      code: "23505",
      constraint: "users_email_key",
    });

    errorHandler(err as never, makeReq(), res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        statusCode: 409,
        message: "A record with this value already exists.",
      },
    });
  });

  it("exposes db details in development", () => {
    process.env.ENVIRONMENT = "DEV";
    const res = makeRes();
    const err = new DbError("A record with this value already exists.", 409, {
      code: "23505",
      constraint: "users_email_key",
      detail: "Key (email) already exists.",
      hint: "Choose a different email.",
      table: "users",
      column: "email",
    });

    errorHandler(err as never, makeReq(), res, next);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        statusCode: 409,
        message: "A record with this value already exists.",
        details: {
          code: "23505",
          constraint: "users_email_key",
          table: "users",
          column: "email",
          detail: "Key (email) already exists.",
          hint: "Choose a different email.",
        },
      },
    });
  });

  it("does not leak details for non-db errors", () => {
    process.env.ENVIRONMENT = "DEV";
    const res = makeRes();
    const err = new Error("boom");

    errorHandler(err as never, makeReq(), res, next);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        statusCode: 500,
        message: "boom",
      },
    });
  });
});

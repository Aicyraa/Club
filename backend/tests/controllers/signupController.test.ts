import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

vi.mock("bcryptjs", () => ({
  default: { hash: vi.fn() },
}));

vi.mock("../../src/models/query", () => ({
  addUser: vi.fn(),
}));

import bcrypt from "bcryptjs";
import { addUser } from "../../src/models/query";
import { signinForm } from "../../src/middlewares/formValidator";
import { postUser } from "../../src/controllers/signupController";

const validBody = {
  email: "user@example.com",
  username: "alice",
  password: "secret123",
};

const makeReq = async (body: Record<string, unknown>) => {
  const req = { body } as unknown as Request;
  await Promise.all(signinForm.map((validator) => validator.run(req)));
  return req;
};

const makeRes = () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response;
  return res;
};

describe("postUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(bcrypt.hash).mockResolvedValue("hashed-password");
    vi.mocked(addUser).mockResolvedValue({} as never);
  });

  it("returns 400 with validation errors for an invalid payload", async () => {
    const req = await makeReq({ email: "bad", username: "", password: "123" });
    const res = makeRes();
    const next = vi.fn();

    await postUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 400, errors: expect.any(Array) }),
    );
    expect(addUser).not.toHaveBeenCalled();
  });

  it("hashes the password and creates the user on success", async () => {
    const req = await makeReq(validBody);
    const res = makeRes();
    const next = vi.fn();

    await postUser(req, res, next);

    expect(bcrypt.hash).toHaveBeenCalledWith("secret123", 10);
    expect(addUser).toHaveBeenCalledWith({
      email: "user@example.com",
      username: "alice",
      password: "hashed-password",
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: 201,
      message: "User created.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("forwards database errors to the error handler", async () => {
    const req = await makeReq(validBody);
    const res = makeRes();
    const next = vi.fn();
    const dbError = new Error("Database query failed.");
    vi.mocked(addUser).mockRejectedValue(dbError);

    await postUser(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
    expect(res.status).not.toHaveBeenCalled();
  });
});
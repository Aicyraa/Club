import { describe, it, expect } from "vitest";
import { validationResult } from "express-validator";
import { signinForm } from "../../src/middlewares/formValidator";

const runValidators = async (body: Record<string, unknown>) => {
  const req = { body } as any;
  await Promise.all(signinForm.map((validator) => validator.run(req)));
  return validationResult(req);
};

describe("signinForm", () => {
  it("accepts a valid signin payload", async () => {
    const result = await runValidators({
      email: "user@example.com",
      username: "alice",
      password: "secret123",
    });

    expect(result.isEmpty()).toBe(true);
  });

  it("rejects an invalid email", async () => {
    const result = await runValidators({
      email: "not-an-email",
      username: "alice",
      password: "secret123",
    });

    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].msg).toBe("Email is invalid.");
  });

  it("rejects an empty username", async () => {
    const result = await runValidators({
      email: "user@example.com",
      username: "",
      password: "secret123",
    });

    expect(result.isEmpty()).toBe(false);
    expect(result.array().some((e) => e.msg === "Lastname is empty.")).toBe(true);
  });

  it("rejects a password shorter than 6 characters", async () => {
    const result = await runValidators({
      email: "user@example.com",
      username: "alice",
      password: "12345",
    });

    expect(result.isEmpty()).toBe(false);
    expect(
      result.array().some((e) => e.msg === "Password cannot be less than 6."),
    ).toBe(true);
  });
});
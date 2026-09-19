import { RequestError } from "@/types";
import type { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: RequestError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const isDev = process.env.ENVIRONMENT === "DEV";
  const message =
    isDev || statusCode < 500
      ? err.message || "Internal Server Error!"
      : "Internal Server Error!";

  res.status(statusCode).json({
    success: false,
    error: {
      statusCode,
      message,
    },
  });
};

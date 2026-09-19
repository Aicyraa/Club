import type { Express, Request, Response, NextFunction } from "express";
import type { RequestError } from "./types";
import express from "express";
import helmet from "helmet";
import AppError from "./error/appError";
import { generalLimiter } from "./middlewares/rateLimiter";
import { errorHandler } from "./middlewares/errorHandler";
import { signup } from "./routes/signupRoute";

const PORT = process.env.PORT;
const app: Express = express();

app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(generalLimiter);

app.use("/signup", signup);

app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new AppError("Page Not Found", 404) as RequestError;
  next(error);
});

app.use(errorHandler);

app.listen(PORT, () => {
  if (process.env.ENVIRONMENT === "DEV") {
    console.log(`Backend: Server listening on port  ${PORT}`);
  }
});

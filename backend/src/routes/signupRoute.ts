import { Router } from "express";
import { postUser } from "../controllers/signupController";
import { signinForm } from "../middlewares/formValidator";
import { formLimiter } from "../middlewares/rateLimiter";

export const signup = Router();

signup.post("/", formLimiter, signinForm, postUser);

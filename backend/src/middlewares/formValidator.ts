import { body } from "express-validator";

export const signinForm = [
  body("firstname")
    .trim()
    .escape()
    .isString()
    .notEmpty()
    .withMessage("Firstname is empty."),
  body("lastname")
    .trim()
    .escape()
    .isString()
    .notEmpty()
    .withMessage("Lastname is empty."),
  body("password")
    .trim()
    .isString()
    .notEmpty()
    .withMessage("Password is empty.")
    .isLength({ min: 6 })
    .withMessage("Password cannot be less than 6."),
];

export const loginForm = [];
export const messageForm = [];

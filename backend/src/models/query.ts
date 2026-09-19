import type { User, Message } from "../types";
import pool from "./pool";

export const addUser = async (user: User) => {
  return await pool.query(
    `
         INSERT INTO users (firstname, lastname, password)
         VALUES ($1, $2, $3)
      `,
    [user.firstname, user.lastname, user.password],
  );
};

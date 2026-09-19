import AppError from "@/error/appError";

export interface Message {
  id: number;
  author: string;
  title: string;
  message: string;
  date: Date;
}

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  password: string;
  membershipStatus: "member" | null;
}

export interface RequestError extends AppError {
  statusCode: number;
  status: string;
  isOperational: boolean;
}

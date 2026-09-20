import AppError from "@/error/appError";

export interface User {
  id: number;
  email: string;
  username: string;
  avatarUrl: string | null;
  isMember: boolean;
  isAdmin: boolean;
  password: string;
}

export type PublicUser = Omit<User, "password">;

export interface Message {
  id: number;
  title: string;
  message: string;
  createdAt: Date;
  author: string;
}

export interface DbErrorDetails {
   code?: string;
   constraint?: string;
   detail?: string;
   hint?: string;
   table?: string;
   column?: string;
   schema?: string;
   routine?: string;
 }
 

export interface RequestError extends AppError {
  statusCode: number;
  status: string;
  isOperational: boolean;
}

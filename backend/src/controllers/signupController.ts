import type { RequestWithBody, User } from '@custom-types/type';
import type { NextFunction, Response } from 'express';

import { addUser } from '@models/query';
import AppError from '@utils/appError';
import bcrypt from 'bcryptjs';
import { matchedData, validationResult } from 'express-validator';
import ApiResponse from '@utils/ApiResponse';

interface SignupBody {
   email: string,
   username: string,
   password: string,
}

export const postUser = async (
   req: RequestWithBody<SignupBody>,
   res: Response,
   next: NextFunction,
) => {
   const errors = validationResult(req)

   if (!errors.isEmpty()) {
      next(new AppError(errors.array() as unknown as string, 400))
   }

   const data = matchedData(req)
   const saltRounds = 10
   const hashedPass = await bcrypt.hash(data.password, saltRounds)

   await addUser({ ...data, password: hashedPass } as User)

   return res.status(201).json(new ApiResponse('User Created', 201))
}

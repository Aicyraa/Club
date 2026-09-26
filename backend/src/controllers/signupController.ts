import type { RequestWithBody, User } from '@custom-types/type';
import type { NextFunction, Request, Response } from 'express';

import { addUser } from '@models/query';
import AppError from '@utils/appError';
import bcrypt from 'bcryptjs';
import { matchedData, validationResult } from 'express-validator';

export const postUser = async (
   req: RequestWithBody<User>,
   res: Response,
   next: NextFunction,
) => {
   const errors = validationResult(req)

   if (!errors.isEmpty()) {
      next(new AppError(errors.array() as unknown as string, 400))
   }

   const data: User = matchedData(req)
   const saltRounds = 10
   const hashedPass = await bcrypt.hash(data.password, saltRounds)

   await addUser({ ...data, password: hashedPass } as User)

   return res.status(201).json({ success: true, status: 201, message: 'User created' })
}

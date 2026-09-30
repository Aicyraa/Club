import type { RequestWithBody } from '@custom-types/type'
import type { SignupFields, User } from '@repo/types'
import type { NextFunction, Response } from 'express'

import { addUser } from '@models/query'
import AppError from '@utils/appError'
import bcrypt from 'bcryptjs'
import { matchedData, validationResult } from 'express-validator'
import ApiResponse from '@utils/ApiResponse'

export const postUser = async (
   req: RequestWithBody<SignupFields>,
   res: Response,
   next: NextFunction,
) => {
   const errors = validationResult(req)

   if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0]?.msg as string, 400))
   }

   const data = matchedData(req) as User

   try {
      const saltRounds = 10
      const hashedPass = await bcrypt.hash(data.password, saltRounds)
      const seed = encodeURIComponent(`user-${data.username}`)
      const avatarAPI = `https://api.dicebear.com/10.x/lorelei/svg?seed=${seed}`

      await addUser({ ...data, avatar_url: avatarAPI, password: hashedPass } as User)

      return res.status(201).json(new ApiResponse('User Created', 201))
   } catch (error: unknown) {
      next(error)
   }
}

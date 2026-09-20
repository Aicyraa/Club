import type { Request, Response, NextFunction } from 'express'
import type { RequestWithBody ,User } from '../types'

import bcrypt from 'bcryptjs'
import { validationResult, matchedData } from 'express-validator'
import { addUser } from '../models/query'

export const postUser = async (
   req: RequestWithBody<User>,
   res: Response,
   next: NextFunction,
) => {
   const errors = validationResult(req)

   if (!errors.isEmpty()) {
      return res.status(400).json({ status: 400, errors: errors.array() })
   }

   try {
      const data: User = matchedData(req)
      const saltRounds = 10
      const hashedPass = await bcrypt.hash(data.password, saltRounds)

      await addUser({ ...data, password: hashedPass } as User)

      return res.status(201).json({ status: 201, message: 'User created.' })
   } catch (error) {
     return next(error) 
   }
}

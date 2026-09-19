import type { Request, Response, NextFunction } from 'express'
import type { User } from '../types'
import bcrypt from 'bcryptjs'
import { validationResult, matchedData } from 'express-validator'
import { addUser } from '../models/query'

export const postUser = async (
   req: Request<{}, {}, User>,
   res: Response,
   next: NextFunction,
) => {
   const errors = validationResult(req)

   if (errors.isEmpty()) {
      const data = matchedData(req) as User
      const saltRounds = 10
      const hashedPass = await bcrypt.hash(data.password, saltRounds)
      
      addUser({
         firstname: data.firstname,
         lastname: data.lastname,
         password: hashedPass,
      } as User)
   }
   
   return res.status(400).json({ status: 400, errors: errors.array() })
}

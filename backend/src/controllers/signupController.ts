import type { Request, Response, NextFunction } from 'express'
import type { User } from '../types'
import bcrypt from 'bcryptjs'
// import { } from 'express-validator'
import { addUser } from '../models/query'

export const postUser = async (
   req: Request<{}, {}, User>,
   res: Response,
   next: NextFunction,
) => {
   const saltRounds = 10
   const hashedPass = await bcrypt.hash(req.body.password, saltRounds)
   addUser({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      password: hashedPass,
   } as User)
}

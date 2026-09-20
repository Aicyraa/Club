import type { Request, Response, NextFunction } from 'express'
import AppError from '@error/appError'
import type { RequestError } from '@custom-types'

export const unknownPage = (req: Request, res: Response, next: NextFunction) => {
   const error = new AppError('Page Not Found', 404) as RequestError
   next(error)
}

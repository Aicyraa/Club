import type { Request, Response, NextFunction } from 'express'
// app.use(() => {
//    // MUST -  Should dynamically response an error
//    res.status(500).send({ status: err.stack, message: err.message })
// })

// // for undefined routes
// app.use((req: Request, res: Response, next: NextFunction) => {
//    res.status(404).send({  status: 404, next})
// })

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
   // Create a custom error!
   console.log(err.message)

   const message = err.message || 'Internal Server Error!'
   const statusCode = 500

   res.status(statusCode).json({
      success: false,
      error: {
         statusCode,
         message,
      },
   })
}

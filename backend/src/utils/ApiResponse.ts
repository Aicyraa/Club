export default class ApiResponse<T> {
   success: boolean
   message: string
   statusCode: number
   data?: T

   constructor(message: string, statusCode: number, data?: T) {
      ;((this.success = true),
         (this.message = message),
         (this.statusCode = statusCode),
         (this.data = data))
   }
}

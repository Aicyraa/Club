import { PublicUser } from '@custom-types/type'

export default class ResponseJson {
   success: boolean
   message: string
   statusCode: number
   user?: PublicUser

   constructor(message: string, statusCode: number, user?: PublicUser) {
      this.success = true,
      this.message = message,
      this.statusCode = statusCode,
      this.user = user ? user : undefined
   }
}

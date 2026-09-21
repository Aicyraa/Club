import { User as CustomerUser } from './type'

declare global {
   namespace Express {
      interface User extends CustomerUser {}
   }
}

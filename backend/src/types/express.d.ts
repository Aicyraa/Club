import type { PublicUser as CustomerUser } from '@repo/types'

declare global {
   namespace Express {
      interface User extends CustomerUser {}
   }
}

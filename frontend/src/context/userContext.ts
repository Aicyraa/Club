import type { PublicUser } from '@repo/types'
import { createContext, useContext } from 'react'
import type { Dispatch, SetStateAction } from 'react'

export interface UserContextType {
   user: PublicUser | null
   setUser: Dispatch<SetStateAction<PublicUser | null>>
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUserContext = () => {
   const context = useContext(UserContext)

   if (!context) {
      throw new Error('PublicUser context must be inside a user provider!')
   }

   return context
}

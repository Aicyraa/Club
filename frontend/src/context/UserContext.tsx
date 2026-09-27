import type { PublicUser, Children } from '@/types/type'
import React, { createContext, useContext, useState } from 'react'

interface UserContextType {
   user: PublicUser | null
   setUser: React.Dispatch<React.SetStateAction<PublicUser | null>>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider = ({ children }: Children) => {
   const [user, setUser] = useState<PublicUser | null>(null)
   return <UserContext.Provider value={{ user, setUser }}> {children}</UserContext.Provider>
}

export const useUserContext = () => {
   const context = useContext(UserContext)

   if (!context) {
      throw new Error('PublicUser context must be inside a user provider!')
   }

   return context
}

import type { User, Children } from '@/types/type'
import React, { createContext, useContext, useState } from 'react'

interface UserContextType {
   user: User | null
   setUser: React.Dispatch<React.SetStateAction<User | null>>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider = ({ children }: Children) => {
   const [user, setUser] = useState<User | null>(null)
   return <UserContext.Provider value={{ user, setUser }}> {children}</UserContext.Provider>
}

export const useUserContext = () => {
   const context = useContext(UserContext)

   if (!context) {
      throw new Error('User context must be inside a User provider!')
   }

   return context
}

import type { User } from '@custom-types/type'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const UserContext = createContext<User | null>(null)

const UserProvider = ({ children }: { children: ReactNode }) => {
   const [user, setUser] = useState<User | null>(null)
   const [isLoading, setIsLoading] = useState(true)

   useEffect(() => {
      const fetchUser = async () => {
         try {
            const response = await fetch('/api/v1/me', {
               method: 'GET',
               credentials: 'include',
            })

            setIsLoading(false)
            return response.ok ? setUser(await response.json()) : setUser(null)
         } catch (error) {
            setUser(null)
            console.error('Error fetching user:', error)
         }
      }

      fetchUser()

      return () => {
         setUser(null)
         setIsLoading(true)
      }
   }, [user, setUser, isLoading, setIsLoading])

   return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

const useUserContext = () => {
   const context = useContext(UserContext)
   if (context === undefined) {
      throw new Error('useUserContext must be used within a UserProvider')
   }
   return context
}

export { UserProvider, UserContext }
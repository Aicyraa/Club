import type { PublicUser, Role } from '@repo/types'

import { Club } from 'lucide-react'

import UserMenu from '@components/UserMenu'
import AddMessageDialog from '@components/dialogs/AddMessageDialog'

interface AppHeaderProps {
   user: PublicUser
   role: Role
   messageCount: number
   onLogout: () => void
   onUserChange: (user: PublicUser) => void
   onMessageCreated: () => void
}

export const AppHeader = ({
   user,
   role,
   messageCount,
   onLogout,
   onUserChange,
   onMessageCreated,
}: AppHeaderProps) => {
   return (
      <header className="bg-background/90 sticky top-0 z-40 border-t-4 border-t-primary border-b backdrop-blur-xl">
         <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
            <div className="bg-foreground text-background flex items-center gap-2 rounded-full px-3 py-2">
               <Club />
               <span className="text-sm font-semibold tracking-tight">The Club</span>
            </div>

            <div className="flex-1" />

            <div className="hidden sm:block">
               <AddMessageDialog onCreated={onMessageCreated} />
            </div>

            <UserMenu
               user={user}
               role={role}
               messageCount={messageCount}
               onLogout={onLogout}
               onUserChange={onUserChange}
            />
         </div>
      </header>
   )
}

export default AppHeader

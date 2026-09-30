import type { PublicUser, Role } from '@repo/types'
import { useState } from 'react'
import {
   BadgeCheck,
   Crown,
   LogOut,
   MessageSquare,
   Settings2,
   ShieldCheck,
   Sparkles,
} from 'lucide-react'

import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuGroup,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import MembershipDialog from '@components/dialogs/MembershipDialog'
import ChangePasswordDialog from '@components/dialogs/ChangePasswordDialog'
import EditProfileDialog from '@components/dialogs/EditProfileDialog'

interface UserMenuProps {
   user: PublicUser
   role: Role
   messageCount: number
   onLogout: () => void
   onUserChange: (user: PublicUser) => void
}

const ROLE_LABEL: Record<Role, string> = {
   normal: 'Normal',
   member: 'Member',
   admin: 'Admin',
}

const initials = (username: string) => username.slice(0, 2).toUpperCase()

export const UserMenu = ({ user, role, messageCount, onLogout, onUserChange }: UserMenuProps) => {
   const [membershipOpen, setMembershipOpen] = useState(false)
   const [passwordOpen, setPasswordOpen] = useState(false)
   const [editOpen, setEditOpen] = useState(false)

   return (
      <>
         <DropdownMenu>
            <DropdownMenuTrigger
               render={
                  <Button
                     variant="ghost"
                     size="icon"
                     className="rounded-full"
                     aria-label="Open account menu"
                  />
               }
            >
               <Avatar className="size-7">
                  <AvatarImage src={user.avatar_url ?? undefined} />
                  <AvatarFallback>{initials(user.username)}</AvatarFallback>
               </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64">
               <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                     <div className="flex items-center gap-3">
                        <Avatar>
                           <AvatarImage src={user.avatar_url ?? undefined} />
                           <AvatarFallback>{initials(user.username)}</AvatarFallback>
                        </Avatar>
                        <div className="flex min-w-0 flex-col gap-1">
                           <p className="truncate text-sm font-medium">{user.username}</p>
                           <p className="text-muted-foreground truncate text-xs">{user.email}</p>
                        </div>
                     </div>
                  </DropdownMenuLabel>
               </DropdownMenuGroup>

               <DropdownMenuSeparator />

               <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-muted-foreground flex items-center justify-between font-normal text-xs">
                     <span className="flex items-center gap-1.5">
                        <BadgeCheck className="size-3.5" />
                        {ROLE_LABEL[role]}
                     </span>
                     <span className="flex items-center gap-1.5">
                        <MessageSquare className="size-3.5" />
                        {messageCount} posted
                     </span>
                  </DropdownMenuLabel>
               </DropdownMenuGroup>

               {role === 'normal' && (
                  <>
                     <DropdownMenuSeparator />
                     <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => setMembershipOpen(true)}>
                           <Sparkles data-icon="inline-start" />
                           Become a member
                        </DropdownMenuItem>
                     </DropdownMenuGroup>
                  </>
               )}

               {role === 'admin' && (
                  <>
                     <DropdownMenuSeparator />
                     <DropdownMenuGroup>
                        <DropdownMenuItem disabled>
                           <ShieldCheck data-icon="inline-start" />
                           Admin: can delete any message
                        </DropdownMenuItem>
                     </DropdownMenuGroup>
                  </>
               )}

               {role === 'member' && (
                  <>
                     <DropdownMenuSeparator />
                     <DropdownMenuGroup>
                        <DropdownMenuItem disabled>
                           <Crown data-icon="inline-start" />
                           Member: authors are visible
                        </DropdownMenuItem>
                     </DropdownMenuGroup>
                  </>
               )}

               <DropdownMenuSeparator />

               <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                     <Settings2 data-icon="inline-start" />
                     Change username
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => setPasswordOpen(true)}>
                     <BadgeCheck data-icon="inline-start" />
                     Change password
                  </DropdownMenuItem>

                  <DropdownMenuItem variant="destructive" onClick={onLogout}>
                     <LogOut data-icon="inline-start" />
                     Log out
                  </DropdownMenuItem>
               </DropdownMenuGroup>
            </DropdownMenuContent>
         </DropdownMenu>

         <MembershipDialog
            open={membershipOpen}
            onOpenChange={setMembershipOpen}
            onUpgraded={onUserChange}
         />
         <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />
         <EditProfileDialog
            open={editOpen}
            onOpenChange={setEditOpen}
            user={user}
            onUpdated={onUserChange}
         />
      </>
   )
}

export default UserMenu

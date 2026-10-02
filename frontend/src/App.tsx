import type { ApiResponse } from '@repo/types'
import { useCallback, useState } from 'react'
import { useLoaderData, useNavigate, useRevalidator } from 'react-router-dom'
import { MessageCircleMore, Sparkles } from 'lucide-react'

import AppHeader from '@components/AppHeader'
import MessageFeed from '@components/MessageFeed'
import AddMessageDialog from '@components/dialogs/AddMessageDialog'
import MembershipDialog from '@components/dialogs/MembershipDialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getRole } from '@/lib/role'
import { useMessages } from '@hooks/useMessages'
import { getApiErrorMessage } from '@services/setup'
import api from '@services/setup'
import type { Profile } from '@repo/types'

function App() {
   // The loader guarantees a non-null profile or a redirect to /login, so there
   // is no "still loading" branch here and no effect needed to hydrate anything.
   const profile = useLoaderData() as Profile
   const navigate = useNavigate()
   const revalidator = useRevalidator()
   const [membershipOpen, setMembershipOpen] = useState(false)

   const { messages, page, totalPages, total, isLoading, error, setPage, reload } = useMessages()
   const role = getRole(profile)

   const logout = useCallback(async () => {
      try {
         await api.post<ApiResponse>('/logout')
      } catch (caught: unknown) {
         // The local session is being dropped regardless, so navigating away is
         // still correct even if the round trip failed.
         console.error(getApiErrorMessage(caught, 'Logout failed.'))
      }

      navigate('/login', { replace: true })
   }, [navigate])

   const deleteMessage = useCallback(
      async (id: number) => {
         try {
            await api.delete(`/messages/${id}`)
            reload()
            // The header shows a post count, so it has to be re-read too.
            revalidator.revalidate()
         } catch (caught: unknown) {
            console.error(getApiErrorMessage(caught, 'Unable to delete that message.'))
         }
      },
      [reload, revalidator],
   )

   const handleMessageCreated = useCallback(() => {
      // A newly posted message belongs on page 1, so a user who had paged away
      // still sees their own post.
      setPage(1)
      reload()
      revalidator.revalidate()
   }, [reload, revalidator, setPage])

   return (
      <div className="min-h-screen">
         <AppHeader
            user={profile}
            role={role}
            messageCount={profile.messageCount}
            onLogout={logout}
            onUserChange={() => revalidator.revalidate()}
            onMessageCreated={handleMessageCreated}
         />

         <main>
            <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:py-12">
               <aside className="flex flex-col gap-5">
                  <Card>
                     <CardHeader>
                        <div className="flex items-center gap-3">
                           <Avatar className="size-11">
                              <AvatarImage src={profile.avatar_url ?? undefined} />
                              <AvatarFallback>{profile.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                           </Avatar>
                           <div className="min-w-0">
                              <CardTitle className="truncate">{profile.username}</CardTitle>
                              <CardDescription className="truncate">{profile.email}</CardDescription>
                           </div>
                           <div className="ml-auto shrink-0 text-right">
                              <p className="text-xl font-semibold tracking-tight">{profile.messageCount}</p>
                              <p className="text-muted-foreground text-xs">Posts shared</p>
                           </div>
                        </div>
                     </CardHeader>
                  </Card>

                  {role === 'normal' && (
                     <Button className="w-full" onClick={() => setMembershipOpen(true)}>
                        <Sparkles data-icon="inline-start" />
                        Unlock membership
                     </Button>
                  )}

                  <div className="sm:hidden">
                     <AddMessageDialog onCreated={handleMessageCreated} />
                  </div>

                  <div className="bg-foreground text-background flex flex-col gap-3 rounded-xl p-5">
                     <MessageCircleMore />
                     <p className="font-medium">Keep it worth reading.</p>
                     <p className="text-background/60 text-xs leading-relaxed">
                        Be candid, be useful, and remember there is a person behind every post.
                     </p>
                  </div>
               </aside>

               <section className="min-w-0">
                  <div className="mb-6 flex items-end justify-between gap-4">
                     <div>
                        <p className="text-muted-foreground mb-1 text-xs font-medium tracking-widest uppercase">
                           Latest from the room
                        </p>
                        <h2 className="text-2xl font-semibold tracking-tight">The board</h2>
                     </div>
                  </div>

                  <MessageFeed
                     messages={messages}
                     page={page}
                     totalPages={totalPages}
                     total={total}
                     isLoading={isLoading}
                     error={error}
                     onPageChange={setPage}
                     onDelete={deleteMessage}
                     onRetry={reload}
                  />
               </section>
            </div>
         </main>

         {role === 'normal' && (
            <MembershipDialog
               open={membershipOpen}
               onOpenChange={setMembershipOpen}
               onUpgraded={() => revalidator.revalidate()}
            />
         )}
      </div>
   )
}

export default App

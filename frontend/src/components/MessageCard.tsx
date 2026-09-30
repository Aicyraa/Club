import type { Message } from '@repo/types'
import { EyeOff, Trash2 } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
   Card,
   CardAction,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from '@/components/ui/card'
import { ANONYMOUS_LABEL, formatRelativeTime, isAnonymous } from '@/lib/messages'

interface MessageCardProps {
   message: Message
   onDelete: (id: number) => void
   isDeleting?: boolean
}

const initials = (username: string) => username.slice(0, 2).toUpperCase()

export const MessageCard = ({ message, onDelete, isDeleting = false }: MessageCardProps) => {
   const anonymous = isAnonymous(message)

   return (
      <Card className="transition-transform hover:-translate-y-0.5">
         <CardHeader>
            <div className="flex items-center gap-3">
               {anonymous ? (
                  <>
                     <div className="bg-secondary grid size-9 place-items-center rounded-full">
                        <EyeOff />
                     </div>
                     <div>
                        <CardTitle className="text-base">{ANONYMOUS_LABEL}</CardTitle>
                        <CardDescription>{formatRelativeTime(message.created_at)}</CardDescription>
                     </div>
                  </>
               ) : (
                  <>
                     <Avatar>
                        <AvatarImage src={message.author?.avatar_url ?? undefined} />
                        <AvatarFallback>{initials(message.author?.username ?? '?')}</AvatarFallback>
                     </Avatar>
                     <div className="min-w-0">
                        <CardTitle className="truncate text-base">
                           {message.author?.username}
                        </CardTitle>
                        <CardDescription>
                           {formatRelativeTime(message.created_at)}
                        </CardDescription>
                     </div>
                  </>
               )}
            </div>

            {/* can_delete comes from the server, not from a client role check,
                so the button only appears when the API would actually accept
                the DELETE. */}
            {message.can_delete && (
               <CardAction>
                  <Button
                     variant="ghost"
                     size="icon-sm"
                     aria-label={`Delete message ${message.message_id}`}
                     disabled={isDeleting}
                     onClick={() => onDelete(message.message_id)}
                  >
                     <Trash2 />
                  </Button>
               </CardAction>
            )}
         </CardHeader>

         <CardContent className="flex flex-col gap-3">
            <Badge variant="outline" className="w-fit">Club note</Badge>
            <p className="text-lg leading-snug font-semibold tracking-tight break-words">{message.title}</p>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap break-words">
               {message.message}
            </p>
         </CardContent>
      </Card>
   )
}

export default MessageCard

import { useState } from 'react'
import { MessageSquareOff } from 'lucide-react'

import type { Message } from '@repo/types'
import {
   Empty,
   EmptyDescription,
   EmptyHeader,
   EmptyMedia,
   EmptyTitle,
} from '@/components/ui/empty'
import {
   Pagination,
   PaginationContent,
   PaginationEllipsis,
   PaginationItem,
   PaginationLink,
   PaginationNext,
   PaginationPrevious,
} from '@/components/ui/pagination'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import MessageCard from '@components/MessageCard'

interface MessageFeedProps {
   messages: Message[]
   page: number
   totalPages: number
   total: number
   isLoading: boolean
   error: string | null
   onPageChange: (page: number) => void
   onDelete: (id: number) => Promise<void>
   onRetry: () => void
}

/**
 * A sliding window of at most 5 page numbers with ellipses at the edges, so the
 * control stays a fixed width no matter how many pages exist.
 */
const pageWindow = (page: number, totalPages: number): (number | 'gap')[] => {
   if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, index) => index + 1)
   }

   const pages = new Set<number>([1, totalPages, page, page - 1, page + 1])
   const sorted = [...pages].filter((value) => value >= 1 && value <= totalPages).sort((a, b) => a - b)

   return sorted.reduce<(number | 'gap')[]>((acc, value, index) => {
      const previous = sorted[index - 1]

      if (previous !== undefined && value - previous > 1) {
         acc.push('gap')
      }

      acc.push(value)
      return acc
   }, [])
}

export const MessageFeed = ({
   messages,
   page,
   totalPages,
   total,
   isLoading,
   error,
   onPageChange,
   onDelete,
   onRetry,
}: MessageFeedProps) => {
   const [deletingId, setDeletingId] = useState<number | null>(null)

   // Awaited so the button's disabled state is cleared even when the request
   // fails — otherwise a failed delete leaves that message permanently stuck.
   const handleDelete = async (id: number) => {
      setDeletingId(id)

      try {
         await onDelete(id)
      } finally {
         setDeletingId((current) => (current === id ? null : current))
      }
   }

   if (isLoading) {
      return (
         <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }, (_, index) => (
               <div key={index} className="space-y-2 rounded-lg border p-6">
                  <div className="flex items-center gap-3">
                     <Skeleton className="size-8 rounded-full" />
                     <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
               </div>
            ))}
         </div>
      )
   }

   if (error) {
      return (
         <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between gap-4">
               <span>{error}</span>
               <Button variant="outline" size="sm" onClick={onRetry}>
                  Retry
               </Button>
            </AlertDescription>
         </Alert>
      )
   }

   if (!messages.length) {
      return (
         <Empty className="border">
            <EmptyHeader>
               <EmptyMedia variant="icon">
                  <MessageSquareOff />
               </EmptyMedia>
               <EmptyTitle>No messages yet</EmptyTitle>
               <EmptyDescription>
                  Nothing has been posted here. Be the first to say something.
               </EmptyDescription>
            </EmptyHeader>
         </Empty>
      )
   }

   return (
      <div className="flex flex-col gap-5">
         <div className="flex flex-col gap-4">
            {messages.map((message) => (
               <MessageCard
                  key={message.message_id}
                  message={message}
                  onDelete={handleDelete}
                  isDeleting={deletingId === message.message_id}
               />
            ))}
         </div>

         {totalPages > 1 && (
            <Pagination>
               <PaginationContent>
                  <PaginationItem>
                     <PaginationPrevious
                        href="#"
                        onClick={(event: React.MouseEvent) => {
                           event.preventDefault()
                           if (page > 1) {
                              onPageChange(page - 1)
                           }
                        }}
                     />
                  </PaginationItem>

                  {pageWindow(page, totalPages).map((entry, index) =>
                     entry === 'gap' ? (
                        <PaginationItem key={`gap-${index}`}>
                           <PaginationEllipsis />
                        </PaginationItem>
                     ) : (
                        <PaginationItem key={entry}>
                           <PaginationLink
                              href="#"
                              isActive={entry === page}
                              onClick={(event: React.MouseEvent) => {
                                 event.preventDefault()
                                 onPageChange(entry)
                              }}
                           >
                              {entry}
                           </PaginationLink>
                        </PaginationItem>
                     ),
                  )}

                  <PaginationItem>
                     <PaginationNext
                        href="#"
                        onClick={(event: React.MouseEvent) => {
                           event.preventDefault()
                           if (page < totalPages) {
                              onPageChange(page + 1)
                           }
                        }}
                     />
                  </PaginationItem>
               </PaginationContent>
            </Pagination>
         )}

         <p className="text-muted-foreground text-center text-xs">
            Page {page} of {totalPages} · {total} message{total === 1 ? '' : 's'}
         </p>
      </div>
   )
}

export default MessageFeed

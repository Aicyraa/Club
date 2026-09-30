import type { ApiResponse, Message, Paginated } from '@repo/types'
import { useCallback, useEffect, useState } from 'react'

import { getApiErrorMessage } from '@services/setup'
import api from '@services/setup'

const PAGE_LIMIT = 10

interface UseMessagesResult {
   messages: Message[]
   page: number
   totalPages: number
   total: number
   isLoading: boolean
   error: string | null
   setPage: (page: number) => void
   reload: () => void
}

export const useMessages = (): UseMessagesResult => {
   const [messages, setMessages] = useState<Message[]>([])
   const [page, setPage] = useState(1)
   const [totalPages, setTotalPages] = useState(1)
   const [total, setTotal] = useState(0)
   const [isLoading, setIsLoading] = useState(true)
   const [error, setError] = useState<string | null>(null)
   // Bumped by reload() so the effect refetches without needing reload in its
   // dependency list, which would refetch on every render.
   const [nonce, setNonce] = useState(0)

   useEffect(() => {
      let cancelled = false

      const load = async () => {
         setIsLoading(true)
         setError(null)

         try {
            const response = await api.get<ApiResponse<Paginated<Message>>>('/messages', {
               params: { page, pageLimit: PAGE_LIMIT },
            })

            if (cancelled) {
               return
            }

            const data = response.data.data

            setMessages(data?.items ?? [])
            setTotalPages(data?.totalPages ?? 1)
            setTotal(data?.total ?? 0)
         } catch (caught: unknown) {
            if (cancelled) {
               return
            }

            setMessages([])
            setError(getApiErrorMessage(caught, 'Unable to load messages.'))
         } finally {
            if (!cancelled) {
               setIsLoading(false)
            }
         }
      }

      void load()

      return () => {
         cancelled = true
      }
   }, [page, nonce])

   const reload = useCallback(() => {
      setNonce((value) => value + 1)
   }, [])

   return { messages, page, totalPages, total, isLoading, error, setPage, reload }
}

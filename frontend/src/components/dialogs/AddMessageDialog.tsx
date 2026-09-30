import type { ApiResponse } from '@repo/types'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { MessageSquarePlus, Send } from 'lucide-react'

import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { getApiErrorMessage } from '@services/setup'
import api from '@services/setup'

interface AddMessageFields {
   title: string
   message: string
   is_anonymous: boolean
}

interface AddMessageDialogProps {
   onCreated: () => void
}

export const AddMessageDialog = ({ onCreated }: AddMessageDialogProps) => {
   const [open, setOpen] = useState(false)
   const [serverError, setServerError] = useState<string | null>(null)

   const {
      register,
      handleSubmit,
      reset,
      formState: { errors, isSubmitting },
   } = useForm<AddMessageFields>({
      defaultValues: { title: '', message: '', is_anonymous: false },
   })

   const create = async (data: AddMessageFields) => {
      setServerError(null)

      try {
         await api.post<ApiResponse>('/messages', data)
         reset()
         setOpen(false)
         onCreated()
      } catch (error: unknown) {
         setServerError(getApiErrorMessage(error, 'Unable to post your message.'))
      }
   }

   return (
      <Dialog
         open={open}
         onOpenChange={(next: boolean) => {
            setOpen(next)
            if (!next) {
               setServerError(null)
            }
         }}
      >
         <DialogTrigger render={<Button />}>
            <MessageSquarePlus data-icon="inline-start" />
            New message
         </DialogTrigger>

         <DialogContent className="sm:max-w-lg">
            <DialogHeader>
               <DialogTitle>Post a message</DialogTitle>
               <DialogDescription>
                  Say something to the club. Members and admins can see who posted it.
               </DialogDescription>
            </DialogHeader>

            <form
               className="flex flex-col gap-5"
               onSubmit={handleSubmit(create)}
            >
               {serverError && (
                  <Alert variant="destructive">
                     <AlertDescription>{serverError}</AlertDescription>
                  </Alert>
               )}

               <Field data-invalid={!!errors.title}>
                  <FieldLabel htmlFor="title">Title</FieldLabel>
                  <Input
                     id="title"
                     placeholder="What is this about?"
                     aria-invalid={!!errors.title}
                     {...register('title', {
                        required: 'Title is empty.',
                        maxLength: { value: 120, message: 'Title cannot exceed 120.' },
                     })}
                  />
                  <FieldError errors={[{ message: errors.title?.message as string }]} />
               </Field>

               <Field data-invalid={!!errors.message}>
                  <FieldLabel htmlFor="message">Message</FieldLabel>
                  <Textarea
                     id="message"
                     rows={5}
                     placeholder="Say your piece."
                     aria-invalid={!!errors.message}
                     {...register('message', {
                        required: 'Message is empty.',
                        maxLength: { value: 5000, message: 'Message cannot exceed 5000.' },
                     })}
                  />
                  <FieldError errors={[{ message: errors.message?.message as string }]} />
               </Field>

               <Field orientation="horizontal">
                  <Checkbox
                     id="is_anonymous"
                     {...register('is_anonymous')}
                  />
                  <FieldLabel htmlFor="is_anonymous">
                     Post anonymously
                     <span className="text-muted-foreground block text-xs font-normal">
                        Your name is hidden from every viewer, including admins.
                     </span>
                  </FieldLabel>
               </Field>

               <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                     {isSubmitting ? (
                        <Spinner data-icon="inline-start" />
                     ) : (
                        <Send data-icon="inline-start" />
                     )}
                     {isSubmitting ? 'Posting' : 'Post'}
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   )
}

export default AddMessageDialog

import type { ApiResponse, PublicUser } from '@repo/types'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { getApiErrorMessage } from '@services/setup'
import api from '@services/setup'

interface EditProfileFields {
   username: string
   avatar_url: string
}

interface EditProfileDialogProps {
   open: boolean
   onOpenChange: (open: boolean) => void
   user: PublicUser
   onUpdated: (user: PublicUser) => void
}

export const EditProfileDialog = ({
   open,
   onOpenChange,
   user,
   onUpdated,
}: EditProfileDialogProps) => {
   const [serverError, setServerError] = useState<string | null>(null)

   const {
      register,
      control,
      handleSubmit,
      reset,
      formState: { errors, isSubmitting },
   } = useForm<EditProfileFields>({
      // `values` (not `defaultValues`) so switching users or reopening the
      // dialog re-seeds the form from the current user.
      values: {
         username: user.username,
         avatar_url: user.avatar_url ?? '',
      },
   })

   // useWatch rather than watch(): watch() returns a new function each render
   // and opts this component out of React Compiler memoization.
   const [avatarInput, usernameInput] = useWatch({
      control,
      name: ['avatar_url', 'username'],
   })

   // Live preview: the avatar field is the source of truth, falling back to the
   // saved value while it is empty.
   const preview = avatarInput || user.avatar_url || undefined
   const username = usernameInput || user.username

   const submit = async (data: EditProfileFields) => {
      setServerError(null)

      try {
         const response = await api.patch<ApiResponse<PublicUser>>('/profiles', {
            username: data.username,
            // An empty field means "leave it alone", so it is not sent at all.
            ...(data.avatar_url ? { avatar_url: data.avatar_url } : {}),
         })

         if (response.data.data) {
            onUpdated(response.data.data)
         }

         reset()
         onOpenChange(false)
      } catch (error: unknown) {
         setServerError(getApiErrorMessage(error, 'Unable to update your profile.'))
      }
   }

   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent className="sm:max-w-md">
            <DialogHeader>
               <DialogTitle>Edit profile</DialogTitle>
               <DialogDescription>
                  Change how you appear next to the messages you post.
               </DialogDescription>
            </DialogHeader>

            <form
               className="flex flex-col gap-5"
               onSubmit={handleSubmit(submit)}
            >
               {serverError && (
                  <Alert variant="destructive">
                     <AlertDescription>{serverError}</AlertDescription>
                  </Alert>
               )}

               <div className="flex items-center gap-4">
                  <Avatar className="size-14">
                     <AvatarImage src={preview} />
                     <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <p className="text-muted-foreground text-sm">
                     Your avatar is a URL. Any image host works.
                  </p>
               </div>

               <Field data-invalid={!!errors.username}>
                  <FieldLabel htmlFor="edit-username">Username</FieldLabel>
                  <Input
                     id="edit-username"
                     autoComplete="username"
                     aria-invalid={!!errors.username}
                     {...register('username', {
                        required: 'Username is empty.',
                        minLength: { value: 3, message: 'Username cannot be less than 3.' },
                        maxLength: { value: 32, message: 'Username cannot exceed 32.' },
                     })}
                  />
                  <FieldError errors={[{ message: errors.username?.message as string }]} />
               </Field>

               <Field data-invalid={!!errors.avatar_url}>
                  <FieldLabel htmlFor="avatar_url">Avatar URL</FieldLabel>
                  <Input
                     id="avatar_url"
                     type="url"
                     placeholder="https://example.com/me.png"
                     aria-invalid={!!errors.avatar_url}
                     {...register('avatar_url', {
                        pattern: {
                           value: /^https?:\/\/.+/,
                           message: 'Avatar must be a valid URL.',
                        },
                     })}
                  />
                  <FieldError errors={[{ message: errors.avatar_url?.message as string }]} />
               </Field>

               <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                     {isSubmitting && <Spinner data-icon="inline-start" />}
                     {isSubmitting ? 'Saving' : 'Save changes'}
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   )
}

export default EditProfileDialog

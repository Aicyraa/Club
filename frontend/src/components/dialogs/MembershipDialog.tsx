import type { ApiResponse, PublicUser } from '@repo/types'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { KeyRound } from 'lucide-react'

import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { getApiErrorMessage } from '@services/setup'
import api from '@services/setup'

interface MembershipFields {
   code: string
}

interface MembershipDialogProps {
   open: boolean
   onOpenChange: (open: boolean) => void
   onUpgraded: (user: PublicUser) => void
}

export const MembershipDialog = ({ open, onOpenChange, onUpgraded }: MembershipDialogProps) => {
   const [serverError, setServerError] = useState<string | null>(null)

   const {
      register,
      handleSubmit,
      reset,
      formState: { errors, isSubmitting },
   } = useForm<MembershipFields>({ defaultValues: { code: '' } })

   const redeem = async (data: MembershipFields) => {
      setServerError(null)

      try {
         const response = await api.post<ApiResponse<PublicUser>>('/profiles/membership', data)
         reset()
         onOpenChange(false)

         if (response.data.data) {
            onUpgraded(response.data.data)
         }
      } catch (error: unknown) {
         setServerError(getApiErrorMessage(error, 'That code was not accepted.'))
      }
   }

   return (
      <Dialog
         open={open}
         onOpenChange={(next: boolean) => {
            onOpenChange(next)
            if (!next) {
               setServerError(null)
            }
         }}
      >
         <DialogContent className="sm:max-w-md">
            <DialogHeader>
               <DialogTitle className="flex items-center gap-2">
                  <KeyRound className="text-muted-foreground" />
                  Unlock membership
               </DialogTitle>
               <DialogDescription>
                  Enter the membership passcode to unlock member access.
               </DialogDescription>
            </DialogHeader>

            <form
               className="flex flex-col gap-5"
               onSubmit={handleSubmit(redeem)}
            >
               {serverError && (
                  <Alert variant="destructive">
                     <AlertDescription>{serverError}</AlertDescription>
                  </Alert>
               )}

               <Field data-invalid={!!errors.code}>
                  <FieldLabel htmlFor="code">Secret code</FieldLabel>
                  <Input
                     id="code"
                     autoComplete="off"
                     placeholder="Enter your code"
                     aria-invalid={!!errors.code}
                     {...register('code', { required: 'Membership code is empty.' })}
                  />
                  <FieldError errors={[{ message: errors.code?.message as string }]} />
               </Field>

               <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                     {isSubmitting && <Spinner data-icon="inline-start" />}
                     {isSubmitting ? 'Checking' : 'Unlock'}
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   )
}

export default MembershipDialog

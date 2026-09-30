import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'

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
import {
   InputGroup,
   InputGroupAddon,
   InputGroupButton,
   InputGroupInput,
} from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import { getApiErrorMessage } from '@services/setup'
import api from '@services/setup'

interface ChangePasswordFields {
   currentPassword: string
   newPassword: string
   confirmPassword: string
}

interface ChangePasswordDialogProps {
   open: boolean
   onOpenChange: (open: boolean) => void
}

/**
 * Controlled by the parent rather than owning a DialogTrigger, because it is
 * opened from a DropdownMenuItem — nesting a trigger inside a menu item fights
 * the menu's own click-to-close behavior.
 */
export const ChangePasswordDialog = ({ open, onOpenChange }: ChangePasswordDialogProps) => {
   const [serverError, setServerError] = useState<string | null>(null)
   const [showPassword, setShowPassword] = useState(false)
   const [done, setDone] = useState(false)

   const {
      register,
      handleSubmit,
      reset,
      getValues,
      formState: { errors, isSubmitting },
   } = useForm<ChangePasswordFields>({
      defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
   })

   const submit = async (data: ChangePasswordFields) => {
      setServerError(null)

      try {
         await api.patch('/profiles/password', {
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
         })

         setDone(true)
         reset()
      } catch (error: unknown) {
         setServerError(getApiErrorMessage(error, 'Unable to change your password.'))
      }
   }

   const handleOpenChange = (next: boolean) => {
      onOpenChange(next)

      if (!next) {
         setServerError(null)
         setDone(false)
      }
   }

   return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
         <DialogContent className="sm:max-w-md">
            <DialogHeader>
               <DialogTitle>Change password</DialogTitle>
               <DialogDescription>
                  You will stay signed in, but your previous session is invalidated.
               </DialogDescription>
            </DialogHeader>

            {done ? (
               <>
                  <Alert>
                     <AlertDescription>Your password has been changed.</AlertDescription>
                  </Alert>
                  <DialogFooter>
                     <Button onClick={() => handleOpenChange(false)}>Done</Button>
                  </DialogFooter>
               </>
            ) : (
               <form
                  className="flex flex-col gap-5"
                  onSubmit={handleSubmit(submit)}
               >
                  {serverError && (
                     <Alert variant="destructive">
                        <AlertDescription>{serverError}</AlertDescription>
                     </Alert>
                  )}

                  <Field data-invalid={!!errors.currentPassword}>
                     <FieldLabel htmlFor="currentPassword">Current password</FieldLabel>
                     <InputGroup>
                        <InputGroupInput
                           id="currentPassword"
                           type={showPassword ? 'text' : 'password'}
                           autoComplete="current-password"
                           aria-invalid={!!errors.currentPassword}
                           {...register('currentPassword', {
                              required: 'Current password is empty.',
                           })}
                        />
                        <InputGroupAddon align="inline-end">
                           <InputGroupButton
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                              aria-pressed={showPassword}
                              onClick={() => setShowPassword((value: boolean) => !value)}
                           >
                              {showPassword ? <EyeOff /> : <Eye />}
                           </InputGroupButton>
                        </InputGroupAddon>
                     </InputGroup>
                     <FieldError errors={[{ message: errors.currentPassword?.message as string }]} />
                  </Field>

                  <Field data-invalid={!!errors.newPassword}>
                     <FieldLabel htmlFor="newPassword">New password</FieldLabel>
                     <Input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        aria-invalid={!!errors.newPassword}
                        {...register('newPassword', {
                           required: 'New password is empty.',
                           minLength: { value: 6, message: 'New password cannot be less than 6.' },
                        })}
                     />
                     <FieldError errors={[{ message: errors.newPassword?.message as string }]} />
                  </Field>

                  <Field data-invalid={!!errors.confirmPassword}>
                     <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
                     <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        aria-invalid={!!errors.confirmPassword}
                        {...register('confirmPassword', {
                           required: 'Please confirm your new password.',
                           validate: (value: string) =>
                              value === getValues('newPassword') || 'Passwords do not match.',
                        })}
                     />
                     <FieldError errors={[{ message: errors.confirmPassword?.message as string }]} />
                  </Field>

                  <DialogFooter>
                     <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Spinner data-icon="inline-start" />}
                        {isSubmitting ? 'Saving' : 'Change password'}
                     </Button>
                  </DialogFooter>
               </form>
            )}
         </DialogContent>
      </Dialog>
   )
}

export default ChangePasswordDialog

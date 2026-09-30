import { Router } from 'express'

import { requireAuth } from '@middlewares/auth'
import { rejectPrivileged } from '@middlewares/messageMiddleware'
import { changePasswordForm, membershipForm, updateProfileForm } from '@middlewares/formValidator'
import {
   changePassword,
   getProfile,
   updateProfile,
   upgradeMembership,
} from '@controllers/profileController'

export const profiles = Router()

profiles.use(requireAuth)

profiles.get('/', getProfile)
profiles.patch('/', updateProfileForm, updateProfile)
profiles.patch('/password', changePasswordForm, changePassword)

// A member or admin redeeming a code would be a no-op, so it is rejected up
// front rather than returning a success that changed nothing.
profiles.post('/membership', rejectPrivileged, membershipForm, upgradeMembership)

import axios from 'axios'

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

// Keep the local Vite proxy as the zero-config default. Production can point
// at an absolute API origin (for example https://api.example.com/api/v1/) or
// keep this same-origin path when the reverse proxy serves both applications.
const baseURL = configuredBaseUrl
   ? `${configuredBaseUrl.replace(/\/+$/, '')}/`
   : '/api/v1/'

const api = axios.create({
   baseURL,
   // Session authentication is cookie-based. This is harmless for the local
   // same-origin proxy and required when production serves the API separately.
   withCredentials: true,
})

/**
 * Pulls a human readable message out of an API failure. The backend answers
 * with `{ success: false, error: { statusCode, message } }` (see
 * middlewares/errorHandler), so anything that is not a string is discarded in
 * favour of the caller's fallback.
 */
export const getApiErrorMessage = (error: unknown, fallback: string) => {
   if (axios.isAxiosError(error)) {
      const data = error.response?.data as { error?: { message?: unknown } } | undefined
      const message = data?.error?.message

      if (typeof message === 'string' && message.length > 0) {
         return message
      }
   }

   return fallback
}

export default api

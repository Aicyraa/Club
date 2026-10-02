// Vercel forwards every /api/* request to the same Express application used
// by local development. The app module deliberately does not open a listener.
import app from '../backend/dist/app.js'

export default app

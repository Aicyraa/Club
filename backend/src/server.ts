import app, { sessionStore } from './clubApp'
import pool from '@models/pool'

const port = Number(process.env.PORT)
const environment = process.env.ENVIRONMENT

if (!Number.isInteger(port) || port < 1 || port > 65535) {
   throw new Error('PORT must be an integer between 1 and 65535.')
}

let server: ReturnType<typeof app.listen> | undefined
let isShuttingDown = false

const start = async () => {
   if (environment === 'PROD') {
      // Fail startup if production was deployed before the session schema.
      await pool.query('SELECT sid, sess, expire FROM session LIMIT 0')
   } else {
      await pool.query('SELECT 1')
   }

   server = app.listen(port, () => {
      if (environment !== 'PROD') {
         console.log(`Backend: Server listening on port ${port}`)
      }
   })
}

const shutdown = async (signal: NodeJS.Signals) => {
   if (isShuttingDown) return
   isShuttingDown = true

   if (environment !== 'PROD') console.log(`Backend: Received ${signal}, shutting down`)

   const forceCloseTimer = setTimeout(() => server?.closeAllConnections(), 10_000)
   forceCloseTimer.unref()

   try {
      if (server) {
         await new Promise<void>((resolve, reject) => {
            server?.close((error) => (error ? reject(error) : resolve()))
         })
      }

      await sessionStore.close()
      await pool.end()
   } catch (error) {
      console.error('Backend: Graceful shutdown failed', error)
      process.exitCode = 1
   } finally {
      clearTimeout(forceCloseTimer)
   }
}

process.once('SIGTERM', () => void shutdown('SIGTERM'))
process.once('SIGINT', () => void shutdown('SIGINT'))

void start().catch(async (error: unknown) => {
   console.error('Backend: Startup failed', error)
   process.exitCode = 1
   await sessionStore.close()
   await pool.end()
})

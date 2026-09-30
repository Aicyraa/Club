import { Pool } from 'pg'

const connectionString = process.env.CONNECTION_STRING?.trim()

if (!connectionString) {
   throw new Error('CONNECTION_STRING environment variable is not set.')
}

const pool = new Pool({ connectionString })

// Idle-client failures otherwise become uncaught EventEmitter errors and can
// terminate the process without any useful diagnostic.
pool.on('error', (error) => {
   console.error('Unexpected PostgreSQL pool error:', error)
})

export default pool

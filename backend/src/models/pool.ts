import { Pool } from 'pg'

const connectionString = String(process.env.CONNECTION_STRING)

if (!connectionString) {
   throw new Error('CONNECTION_STRING environment variable is not set.')
}

export default new Pool({ connectionString })

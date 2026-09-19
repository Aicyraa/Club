import { Pool, type PoolConfig} from 'pg'

export const pool = new Pool({
   connectionString: String(process.env.CONNECTION_STRING)
})
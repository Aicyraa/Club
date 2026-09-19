import { Pool, type PoolConfig} from 'pg'

export default new Pool({
   connectionString: String(process.env.CONNECTION_STRING)
})
const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

async function main() {
  const sqlFile = process.argv[2]
  if (!sqlFile) {
    console.error('Usage: node run-sql.js <sql-file>')
    process.exit(1)
  }

  const sql = fs.readFileSync(path.resolve(sqlFile), 'utf-8')

  const client = new Client({
    host: '52.195.10.215',
    port: 5432,
    user: 'postgres',
    password: 'be49d5c2dd46f9ba850332b6e9c0fba9',
    database: 'postgres',
    connectionTimeoutMillis: 10000,
  })

  try {
    await client.connect()
    console.log('Connected to PostgreSQL')
    await client.query(sql)
    console.log('SQL executed successfully')
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()

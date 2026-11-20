import 'dotenv/config';
import { sql } from '../src/db.js';
try {
  const rows = await sql`SELECT current_database() AS database, count(*)::int AS occasions FROM occasions`;
  console.log('Database connection successful:', rows[0].database);
  console.log('Occasions:', rows[0].occasions);
} catch (error) {
  console.error('Database check failed:', error.message);
  process.exitCode = 1;
}

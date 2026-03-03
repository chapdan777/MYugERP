const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function checkDb() {
    const client = new Client({
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT,
        user: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
    });

    try {
        await client.connect();
        console.log('Connected to DB');

        const query = process.argv[2] || `
      SELECT id, name, "defaultLength", "defaultWidth", "defaultDepth"
      FROM products
      ORDER BY id DESC
      LIMIT 5
    `;

        console.log('Running query:', query);
        const res = await client.query(query);

        console.log('Results:');
        console.table(res.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkDb();

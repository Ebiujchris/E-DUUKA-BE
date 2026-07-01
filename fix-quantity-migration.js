const { Client } = require('pg');
require('dotenv').config();

async function fixQuantityColumn() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Step 1: Update any NULL values to 1
    console.log('Updating NULL quantity values...');
    const updateResult = await client.query('UPDATE sales SET quantity = 1 WHERE quantity IS NULL');
    console.log(`Updated ${updateResult.rowCount} rows with NULL quantity`);

    // Step 2: Change column type to decimal
    console.log('Changing quantity column type to DECIMAL(10,2)...');
    await client.query('ALTER TABLE sales ALTER COLUMN quantity TYPE DECIMAL(10,2)');
    console.log('Column type changed successfully!');

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixQuantityColumn();

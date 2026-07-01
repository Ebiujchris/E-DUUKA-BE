const { Client } = require('pg');
require('dotenv').config();

async function fixProductStockColumn() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Step 1: Update any NULL values to 0
    console.log('Updating NULL stockQuantity values...');
    const updateResult = await client.query('UPDATE products SET "stockQuantity" = 0 WHERE "stockQuantity" IS NULL');
    console.log(`Updated ${updateResult.rowCount} rows with NULL stockQuantity`);

    // Step 2: Change column type to decimal
    console.log('Changing stockQuantity column type to DECIMAL(10,2)...');
    await client.query('ALTER TABLE products ALTER COLUMN "stockQuantity" TYPE DECIMAL(10,2)');
    console.log('Column type changed successfully!');

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixProductStockColumn();

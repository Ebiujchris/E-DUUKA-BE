const { Client } = require('pg');
require('dotenv').config();

async function migrateExistingCreditSales() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Get all credit sales that don't have corresponding credit records
    console.log('Finding credit sales...');
    const salesResult = await client.query(`
      SELECT 
        s.id,
        s."customerName",
        s."customerPhone",
        s."totalAmount",
        s."shopId",
        s."userId",
        s."productId",
        s.quantity,
        s."createdAt",
        p.name as product_name
      FROM sales s
      LEFT JOIN products p ON s."productId" = p.id
      WHERE s."paymentType" = 'credit'
        AND s."customerName" IS NOT NULL
    `);

    console.log(`Found ${salesResult.rows.length} credit sales`);

    if (salesResult.rows.length === 0) {
      console.log('No credit sales to migrate');
      return;
    }

    // Create credit records for each credit sale
    let created = 0;
    for (const sale of salesResult.rows) {
      const description = `Credit sale for ${sale.product_name || 'product'} (Qty: ${sale.quantity})`;
      
      await client.query(`
        INSERT INTO credits (
          "customerName",
          "customerPhone",
          "totalAmount",
          "amountPaid",
          description,
          status,
          "shopId",
          "userId",
          "createdAt",
          "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        sale.customerName,
        sale.customerPhone,
        sale.totalAmount,
        0,
        description,
        'pending',
        sale.shopId,
        sale.userId,
        sale.createdAt,
        new Date()
      ]);
      
      created++;
    }

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`Created ${created} credit records from existing credit sales`);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrateExistingCreditSales();

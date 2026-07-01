-- Fix the quantity column to support decimal values
-- Step 1: Update any NULL values to 1 (default)
UPDATE sales SET quantity = 1 WHERE quantity IS NULL;

-- Step 2: Change the column type from integer to decimal
ALTER TABLE sales ALTER COLUMN quantity TYPE DECIMAL(10,2);

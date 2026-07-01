import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './modules/users/users.service';
import { ProductsService } from './modules/products/products.service';
import { SalesService } from './modules/sales/sales.service';
import { PaymentType } from './entities/sale.entity';
import { Product } from './entities/product.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const usersService = app.get(UsersService);
  const productsService = app.get(ProductsService);
  const salesService = app.get(SalesService);

  try {
    // Create a test user
    const user = await usersService.create({
      phone: '+256700000000',
      name: 'John Mukasa',
      password: 'password123',
      shopName: 'Mukasa General Store',
      shopLocation: 'Kampala, Uganda',
      shopInitialCapital: 500000,
    });

    console.log('✅ Created user:', user.name);

    // Create sample products
    const products = [
      {
        name: 'Sugar',
        buyingPrice: 3000,
        sellingPrice: 3500,
        stockQuantity: 50,
        category: 'Food',
        userId: user.id,
      },
      {
        name: 'Soap',
        buyingPrice: 1500,
        sellingPrice: 2000,
        stockQuantity: 30,
        category: 'Personal Care',
        userId: user.id,
      },
      {
        name: 'Rice',
        buyingPrice: 4000,
        sellingPrice: 4500,
        stockQuantity: 8,
        category: 'Food',
        lowStockThreshold: 10,
        userId: user.id,
      },
      {
        name: 'Cooking Oil',
        buyingPrice: 8000,
        sellingPrice: 9000,
        stockQuantity: 25,
        category: 'Food',
        userId: user.id,
      },
      {
        name: 'Bread',
        buyingPrice: 2000,
        sellingPrice: 2500,
        stockQuantity: 3,
        category: 'Food',
        lowStockThreshold: 5,
        userId: user.id,
      },
    ];

    const createdProducts: Product[] = [];
    for (const productData of products) {
      const product = await productsService.create(productData, user.shopId, user.id);
      createdProducts.push(product);
      console.log('✅ Created product:', product.name);
    }

    // Create sample sales
    const sales = [
      {
        productId: createdProducts[0].id,
        quantity: 2,
        unitPrice: 3500,
        paymentType: PaymentType.CASH,
        userId: user.id,
      },
      {
        productId: createdProducts[1].id,
        quantity: 5,
        unitPrice: 2000,
        paymentType: PaymentType.CASH,
        userId: user.id,
      },
      {
        productId: createdProducts[2].id,
        quantity: 1,
        unitPrice: 4500,
        paymentType: PaymentType.CREDIT,
        customerName: 'Mary Nakato',
        userId: user.id,
      },
    ];

    for (const saleData of sales) {
      const sale = await salesService.create(saleData, user.shopId);
      console.log('✅ Created sale:', `${sale.product.name} × ${sale.quantity}`);
    }

    console.log('\n🎉 Seed data created successfully!');
    console.log(`👤 User ID: ${user.id}`);
    console.log('🔗 Test the API at: http://localhost:3001');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await app.close();
  }
}

seed();
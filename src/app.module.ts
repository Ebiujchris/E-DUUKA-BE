import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController, HealthController } from './app.controller';
import { AppService } from './app.service';
import { Shop } from './entities/shop.entity';
import { User } from './entities/user.entity';
import { Product } from './entities/product.entity';
import { Sale } from './entities/sale.entity';
import { Credit } from './entities/credit.entity';
import { Staff } from './entities/staff.entity';
import { Expense } from './entities/expense.entity';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { SalesModule } from './modules/sales/sales.module';
import { CreditsModule } from './modules/credits/credits.module';
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { StaffModule } from './modules/staff/staff.module';
import { ExpensesModule } from './modules/expenses/expenses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
      exclude: ['/api(.*)', '/health'],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Shop, User, Product, Sale, Credit, Staff, Expense],
      synchronize: true,
      logging: false,
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    SalesModule,
    CreditsModule,
    DashboardModule,
    StaffModule,
    ExpensesModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}

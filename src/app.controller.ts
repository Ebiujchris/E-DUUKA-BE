import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getApiInfo() {
    return {
      message: 'Welcome to E-Duuka API',
      version: '1.0.0',
      description: 'Shop Management System for Small Retail Businesses in Uganda',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        products: '/api/products',
        sales: '/api/sales',
        credits: '/api/credits',
        dashboard: '/api/dashboard',
      },
      features: [
        'User Management',
        'Product Inventory',
        'Sales Recording',
        'Credit Management',
        'Dashboard Analytics',
        'Real-time Reports',
      ],
      documentation: '/api-docs.html',
      status: 'active',
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}

// Separate controller for health check at root level
@Controller()
export class HealthController {
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}

import { Injectable } from '@nestjs/common';
import { SalesService } from '../sales/sales.service';
import { ProductsService } from '../products/products.service';
import { CreditsService } from '../credits/credits.service';

@Injectable()
export class DashboardService {
  constructor(
    private salesService: SalesService,
    private productsService: ProductsService,
    private creditsService: CreditsService,
  ) {}

  async getDashboardData(shopId: string) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Get today's sales stats
    const todaysStats = await this.salesService.getSalesStats(shopId, startOfDay, endOfDay);
    
    // Get this week's stats
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const weekStats = await this.salesService.getSalesStats(shopId, startOfWeek, today);
    
    // Get this month's stats
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthStats = await this.salesService.getSalesStats(shopId, startOfMonth, today);

    // Get low stock products
    const lowStockProducts = await this.productsService.findLowStock(shopId);
    
    // Get credit stats
    const creditStats = await this.creditsService.getCreditStats(shopId);
    
    // Get recent sales
    const recentSales = await this.salesService.findAll(shopId);
    const recentSalesLimited = recentSales.slice(0, 5);

    return {
      today: {
        sales: todaysStats.totalSales,
        profit: todaysStats.totalProfit,
        transactions: todaysStats.totalTransactions,
        cashSales: todaysStats.cashSales,
        creditSales: todaysStats.creditSales,
      },
      week: {
        sales: weekStats.totalSales,
        profit: weekStats.totalProfit,
        transactions: weekStats.totalTransactions,
      },
      month: {
        sales: monthStats.totalSales,
        profit: monthStats.totalProfit,
        transactions: monthStats.totalTransactions,
        profitMargin: monthStats.profitMargin,
      },
      inventory: {
        lowStockCount: lowStockProducts.length,
        lowStockProducts: lowStockProducts.slice(0, 5),
      },
      credits: {
        totalOutstanding: creditStats.totalOutstanding,
        pendingCount: creditStats.pendingCredits,
        overdueCount: creditStats.overdueCredits,
      },
      recentActivity: recentSalesLimited.map(sale => ({
        id: sale.id,
        type: 'sale',
        description: `${sale.product.name} × ${sale.quantity}`,
        amount: sale.totalAmount,
        paymentType: sale.paymentType,
        createdAt: sale.createdAt,
      })),
    };
  }

  async getAnalytics(shopId: string, period: 'week' | 'month' | 'year' = 'month') {
    const today = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        break;
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
      default: // month
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    const stats = await this.salesService.getSalesStats(shopId, startDate, today);
    const sales = await this.salesService.findByDateRange(shopId, startDate, today);
    
    // Group sales by day for chart data
    const dailySales = sales.reduce((acc, sale) => {
      const date = sale.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { sales: 0, profit: 0, transactions: 0 };
      }
      acc[date].sales += sale.totalAmount;
      acc[date].profit += (sale.unitPrice - (sale.product?.buyingPrice || 0)) * sale.quantity;
      acc[date].transactions += 1;
      return acc;
    }, {});

    // Get top selling products
    const productSales = sales.reduce((acc, sale) => {
      const productId = sale.productId;
      if (!acc[productId]) {
        acc[productId] = {
          product: sale.product,
          totalQuantity: 0,
          totalRevenue: 0,
        };
      }
      acc[productId].totalQuantity += sale.quantity;
      acc[productId].totalRevenue += sale.totalAmount;
      return acc;
    }, {});

    const topProducts = Object.values(productSales)
      .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    return {
      summary: stats,
      dailySales,
      topProducts,
      period,
    };
  }
}
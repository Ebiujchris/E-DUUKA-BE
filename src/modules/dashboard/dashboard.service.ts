import { Injectable } from '@nestjs/common';
import { SalesService } from '../sales/sales.service';
import { ProductsService } from '../products/products.service';
import { CreditsService } from '../credits/credits.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { ExpensesService } from '../expenses/expenses.service';

@Injectable()
export class DashboardService {
  constructor(
    private salesService: SalesService,
    private productsService: ProductsService,
    private creditsService: CreditsService,
    private suppliersService: SuppliersService,
    private expensesService: ExpensesService,
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

  async getBalanceSheet(shopId: string) {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const [products, creditStats, suppliers, allSales, allExpenses] = await Promise.all([
      this.productsService.findAll(shopId),
      this.creditsService.getCreditStats(shopId),
      this.suppliersService.findAll(shopId),
      this.salesService.findByDateRange(shopId, yearStart, now),
      this.expensesService.findAll(shopId),
    ]);

    // ── ASSETS ────────────────────────────────────────────────────────────────
    // 1. Stock on hand (units × buying price)
    const stockValue = products.reduce(
      (sum, p) => sum + Number(p.stockQuantity) * Number(p.buyingPrice), 0,
    );
    const stockItems = products.map(p => ({
      name: p.name,
      qty: Number(p.stockQuantity),
      buyingPrice: Number(p.buyingPrice),
      value: Number(p.stockQuantity) * Number(p.buyingPrice),
    }));

    // 2. Receivables — money owed to the shop by customers (outstanding credits)
    const receivables = Number(creditStats.totalOutstanding);

    // 3. Revenue this year (proxy for cash earned — bank + till combined)
    const activeSales = allSales.filter(s => s.status !== 'voided');
    const cashRevenue = activeSales
      .filter(s => s.paymentType !== 'credit')
      .reduce((sum, s) => sum + Number(s.totalAmount), 0);

    // ── LIABILITIES ───────────────────────────────────────────────────────────
    // What the shop owes suppliers
    const supplierDebt = suppliers.reduce((sum, s) => sum + Number(s.totalOwed), 0);
    const supplierBreakdown = suppliers
      .filter(s => Number(s.totalOwed) > 0)
      .map(s => ({ name: s.name, owed: Number(s.totalOwed) }));

    // ── INCOME STATEMENT (YTD) ─────────────────────────────────────────────────
    const totalRevenue = activeSales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
    const grossProfit  = activeSales.reduce((sum, s) =>
      sum + (Number(s.unitPrice) - Number(s.product?.buyingPrice ?? 0)) * Number(s.quantity), 0);
    const totalExpenses = allExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const netProfit = grossProfit - totalExpenses;

    // ── EQUITY ────────────────────────────────────────────────────────────────
    const totalAssets = stockValue + receivables + cashRevenue;
    const totalLiabilities = supplierDebt;
    const equity = totalAssets - totalLiabilities;

    return {
      asOf: now.toISOString(),
      assets: {
        stockValue,
        stockItems,
        receivables,
        cashRevenue,
        total: totalAssets,
      },
      liabilities: {
        supplierDebt,
        supplierBreakdown,
        total: totalLiabilities,
      },
      equity,
      incomeStatement: {
        totalRevenue,
        grossProfit,
        totalExpenses,
        netProfit,
        period: `${now.getFullYear()} YTD`,
      },
    };
  }
}
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from '../../entities/shop.entity';
import { SalesService } from '../sales/sales.service';
import { ProductsService } from '../products/products.service';
import { CreditsService } from '../credits/credits.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { ExpensesService } from '../expenses/expenses.service';
import { FixedAssetsService } from '../fixed-assets/fixed-assets.service';
import { ExpenseCategory } from '../../entities/expense.entity';

const TAX_RATE = 0.30; // 30% corporate tax provision

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Shop)
    private shopRepository: Repository<Shop>,
    private salesService: SalesService,
    private productsService: ProductsService,
    private creditsService: CreditsService,
    private suppliersService: SuppliersService,
    private expensesService: ExpensesService,
    private fixedAssetsService: FixedAssetsService,
  ) {}

  async getDashboardData(shopId: string) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const todaysStats = await this.salesService.getSalesStats(shopId, startOfDay, endOfDay);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const weekStats = await this.salesService.getSalesStats(shopId, startOfWeek, today);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthStats = await this.salesService.getSalesStats(shopId, startOfMonth, today);

    const lowStockProducts = await this.productsService.findLowStock(shopId);
    const creditStats = await this.creditsService.getCreditStats(shopId);
    const recentSales = await this.salesService.findAll(shopId);

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
      recentActivity: recentSales.slice(0, 5).map(sale => ({
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
      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    const stats = await this.salesService.getSalesStats(shopId, startDate, today);
    const sales = await this.salesService.findByDateRange(shopId, startDate, today);

    const dailySales = sales.reduce((acc, sale) => {
      const date = sale.createdAt.toISOString().split('T')[0];
      if (!acc[date]) acc[date] = { sales: 0, profit: 0, transactions: 0 };
      acc[date].sales += sale.totalAmount;
      acc[date].profit += (sale.unitPrice - (sale.product?.buyingPrice || 0)) * sale.quantity;
      acc[date].transactions += 1;
      return acc;
    }, {});

    const productSales = sales.reduce((acc, sale) => {
      const productId = sale.productId;
      if (!acc[productId]) acc[productId] = { product: sale.product, totalQuantity: 0, totalRevenue: 0 };
      acc[productId].totalQuantity += sale.quantity;
      acc[productId].totalRevenue += sale.totalAmount;
      return acc;
    }, {});

    const topProducts = Object.values(productSales)
      .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    return { summary: stats, dailySales, topProducts, period };
  }

  // ── helpers ────────────────────────────────────────────────────────────────

  private calcPeriodIncome(sales: any[], expenses: any[]) {
    const active = sales.filter(s => s.status !== 'voided');
    const revenue = active.reduce((s, x) => s + Number(x.totalAmount), 0);
    const grossProfit = active.reduce(
      (s, x) => s + (Number(x.unitPrice) - Number(x.product?.buyingPrice ?? 0)) * Number(x.quantity), 0,
    );
    const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const netProfit = grossProfit - totalExpenses;
    const taxProvision = Math.max(0, netProfit * TAX_RATE);
    const netProfitAfterTax = netProfit - taxProvision;
    return { revenue, grossProfit, totalExpenses, netProfit, taxProvision, netProfitAfterTax };
  }

  // ── BALANCE SHEET ──────────────────────────────────────────────────────────

  async getBalanceSheet(shopId: string) {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const allTimeStart = new Date('2000-01-01');

    const [shop, products, creditStats, suppliers, ytdSales, allTimeSales, ytdExpenses, allTimeExpenses, fixedAssets] =
      await Promise.all([
        this.shopRepository.findOne({ where: { id: shopId } }),
        this.productsService.findAll(shopId),
        this.creditsService.getCreditStats(shopId),
        this.suppliersService.findAll(shopId),
        this.salesService.findByDateRange(shopId, yearStart, now),
        this.salesService.findByDateRange(shopId, allTimeStart, now),
        this.expensesService.findByDateRange(shopId, yearStart, now),
        this.expensesService.findAll(shopId),
        this.fixedAssetsService.findAll(shopId),
      ]);

    const initialCapital = Number(shop?.initialCapital ?? 0);

    // ── ASSETS ────────────────────────────────────────────────────────────────
    const stockValue = products.reduce((s, p) => s + Number(p.stockQuantity) * Number(p.buyingPrice), 0);
    const stockItems = products.map(p => ({
      name: p.name,
      qty: Number(p.stockQuantity),
      buyingPrice: Number(p.buyingPrice),
      value: Number(p.stockQuantity) * Number(p.buyingPrice),
    }));

    const receivables = Number(creditStats.totalOutstanding);

    const activeSalesYTD = ytdSales.filter(s => s.status !== 'voided');
    const cashRevenue = activeSalesYTD
      .filter(s => s.paymentType !== 'credit')
      .reduce((s, x) => s + Number(x.totalAmount), 0);

    // Fixed assets at book value (net of accumulated depreciation)
    const fixedAssetItems = fixedAssets
      .filter(a => a.isActive)
      .map(a => {
        const { bookValue, accumulatedDepreciation, annualDepreciation } =
          this.fixedAssetsService.calcDepreciation(a, now);
        return {
          id: a.id,
          name: a.name,
          category: a.category,
          cost: Number(a.cost),
          accumulatedDepreciation,
          bookValue,
          annualDepreciation,
          acquireDate: a.acquireDate,
        };
      });

    const totalFixedAssets = fixedAssetItems.reduce((s, a) => s + a.bookValue, 0);
    const totalDepreciation = fixedAssetItems.reduce((s, a) => s + a.annualDepreciation, 0);
    const totalAssets = stockValue + receivables + cashRevenue + totalFixedAssets;

    // ── LIABILITIES ───────────────────────────────────────────────────────────
    const supplierDebt = suppliers.reduce((s, x) => s + Number(x.totalOwed), 0);
    const supplierBreakdown = suppliers
      .filter(s => Number(s.totalOwed) > 0)
      .map(s => ({ name: s.name, owed: Number(s.totalOwed) }));

    // ── INCOME STATEMENT (YTD) ────────────────────────────────────────────────
    const ytdIncome = this.calcPeriodIncome(ytdSales, ytdExpenses);

    // Payroll breakdown (YTD salaries category)
    const payrollYTD = ytdExpenses
      .filter(e => e.category === ExpenseCategory.SALARIES)
      .reduce((s, e) => s + Number(e.amount), 0);

    // Expense breakdown by category (YTD)
    const expenseByCategoryMap: Record<string, number> = {};
    for (const e of ytdExpenses) {
      expenseByCategoryMap[e.category] = (expenseByCategoryMap[e.category] ?? 0) + Number(e.amount);
    }
    const expenseBreakdown = Object.entries(expenseByCategoryMap).map(([category, total]) => ({ category, total }));

    // ── RETAINED EARNINGS (all-time net profit before tax) ────────────────────
    const allTimeActive = allTimeSales.filter(s => s.status !== 'voided');
    const grossProfitAllTime = allTimeActive.reduce(
      (s, x) => s + (Number(x.unitPrice) - Number(x.product?.buyingPrice ?? 0)) * Number(x.quantity), 0,
    );
    const totalExpensesAllTime = allTimeExpenses.reduce((s, e) => s + Number(e.amount), 0);
    const retainedEarnings = grossProfitAllTime - totalExpensesAllTime;

    // ── EQUITY ────────────────────────────────────────────────────────────────
    const equity = initialCapital + retainedEarnings;
    const totalLiabilities = supplierDebt;

    return {
      asOf: now.toISOString(),
      assets: {
        stockValue,
        stockItems,
        receivables,
        cashRevenue,
        fixedAssets: fixedAssetItems,
        totalFixedAssets,
        total: totalAssets,
      },
      liabilities: {
        supplierDebt,
        supplierBreakdown,
        total: totalLiabilities,
      },
      equity: {
        initialCapital,
        retainedEarnings,
        total: equity,
      },
      incomeStatement: {
        totalRevenue: ytdIncome.revenue,
        grossProfit: ytdIncome.grossProfit,
        totalExpenses: ytdIncome.totalExpenses,
        netProfit: ytdIncome.netProfit,
        taxProvision: ytdIncome.taxProvision,
        netProfitAfterTax: ytdIncome.netProfitAfterTax,
        payroll: payrollYTD,
        expenseBreakdown,
        annualDepreciation: totalDepreciation,
        period: `${now.getFullYear()} YTD`,
      },
    };
  }

  // ── CASH FLOW STATEMENT ───────────────────────────────────────────────────

  async getCashFlow(shopId: string, year: number = new Date().getFullYear()) {
    const start = new Date(year, 0, 1);
    const end   = new Date(year + 1, 0, 1);

    const [sales, expenses, fixedAssets] = await Promise.all([
      this.salesService.findByDateRange(shopId, start, end),
      this.expensesService.findByDateRange(shopId, start, end),
      this.fixedAssetsService.findAll(shopId),
    ]);

    const activeSales = sales.filter(s => s.status !== 'voided');

    // Operating: cash & mobile in, credit out is not cash yet
    const cashInFromSales = activeSales
      .filter(s => s.paymentType !== 'credit')
      .reduce((s, x) => s + Number(x.totalAmount), 0);

    // Exclude stock purchases — those are tracked as purchase orders, not expenses
    const operatingExpenses = expenses
      .filter(e => e.category !== ExpenseCategory.STOCK_PURCHASE)
      .reduce((s, e) => s + Number(e.amount), 0);

    const stockPurchases = expenses
      .filter(e => e.category === ExpenseCategory.STOCK_PURCHASE)
      .reduce((s, e) => s + Number(e.amount), 0);

    const netOperating = cashInFromSales - operatingExpenses;

    // Investing: fixed assets acquired this year
    const assetsAcquiredThisYear = fixedAssets.filter(a => {
      const d = new Date(a.acquireDate);
      return d >= start && d < end;
    });
    const cashOutForAssets = assetsAcquiredThisYear.reduce((s, a) => s + Number(a.cost), 0);
    const netInvesting = -cashOutForAssets;

    // Financing: initial capital is a one-time inflow (show only for year of shop creation if known, else 0)
    const netFinancing = 0; // no loan/equity draws tracked yet

    return {
      year,
      operating: {
        cashInFromSales,
        operatingExpenses,
        stockPurchases,
        net: netOperating,
      },
      investing: {
        assetsAcquired: assetsAcquiredThisYear.map(a => ({
          name: a.name,
          cost: Number(a.cost),
          date: a.acquireDate,
        })),
        net: netInvesting,
      },
      financing: {
        net: netFinancing,
      },
      netCashFlow: netOperating + netInvesting + netFinancing,
    };
  }

  // ── INCOME COMPARISON (year vs year) ─────────────────────────────────────

  async getIncomeComparison(shopId: string) {
    const now = new Date();
    const currentYear = now.getFullYear();

    const buildYear = async (year: number) => {
      const start = new Date(year, 0, 1);
      const end = year === currentYear ? now : new Date(year + 1, 0, 1);
      const [sales, expenses] = await Promise.all([
        this.salesService.findByDateRange(shopId, start, end),
        this.expensesService.findByDateRange(shopId, start, end),
      ]);
      const inc = this.calcPeriodIncome(sales, expenses);

      // Monthly breakdown for chart
      const monthly = Array.from({ length: 12 }, (_, m) => {
        const ms = sales.filter(s => {
          const d = new Date(s.createdAt);
          return d.getFullYear() === year && d.getMonth() === m && s.status !== 'voided';
        });
        const me = expenses.filter(e => {
          const d = new Date(e.expenseDate);
          return d.getFullYear() === year && d.getMonth() === m;
        });
        const revenue = ms.reduce((s, x) => s + Number(x.totalAmount), 0);
        const expTotal = me.reduce((s, e) => s + Number(e.amount), 0);
        const grossProfit = ms.reduce(
          (s, x) => s + (Number(x.unitPrice) - Number(x.product?.buyingPrice ?? 0)) * Number(x.quantity), 0,
        );
        return { month: m + 1, revenue, grossProfit, expenses: expTotal, netProfit: grossProfit - expTotal };
      });

      return { year, ...inc, monthly, isPartial: year === currentYear };
    };

    const [current, previous] = await Promise.all([
      buildYear(currentYear),
      buildYear(currentYear - 1),
    ]);

    return { current, previous };
  }
}

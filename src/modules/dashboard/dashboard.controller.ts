import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getDashboardData(@Req() req: any) {
    return this.dashboardService.getDashboardData(req.user.shopId);
  }

  @Get('analytics')
  getAnalytics(
    @Query('period') period: 'week' | 'month' | 'year' = 'month',
    @Req() req: any,
  ) {
    return this.dashboardService.getAnalytics(req.user.shopId, period);
  }
}
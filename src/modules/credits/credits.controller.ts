import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CreditsService } from './credits.service';
import { CreateCreditDto, UpdateCreditDto, PayCreditDto } from './dto/credit.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('credits')
@UseGuards(JwtAuthGuard)
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Post()
  create(@Body() createCreditDto: CreateCreditDto, @Req() req: any) {
    return this.creditsService.create(createCreditDto, req.user.shopId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.creditsService.findAll(req.user.shopId);
  }

  @Get('pending')
  findPending(@Req() req: any) {
    return this.creditsService.findPending(req.user.shopId);
  }

  @Get('overdue')
  findOverdue(@Req() req: any) {
    return this.creditsService.findOverdue(req.user.shopId);
  }

  @Get('stats')
  getCreditStats(@Req() req: any) {
    return this.creditsService.getCreditStats(req.user.shopId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.creditsService.findOne(id, req.user.shopId);
  }

  @Post(':id/pay')
  payCredit(
    @Param('id') id: string,
    @Body() paymentDto: PayCreditDto,
    @Req() req: any,
  ) {
    return this.creditsService.payCredit(id, req.user.shopId, paymentDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCreditDto: UpdateCreditDto,
    @Req() req: any,
  ) {
    return this.creditsService.update(id, req.user.shopId, updateCreditDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.creditsService.remove(id, req.user.shopId);
  }
}
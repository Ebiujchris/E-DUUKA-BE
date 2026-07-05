import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { FixedAssetsService } from './fixed-assets.service';
import { CreateFixedAssetDto, UpdateFixedAssetDto } from './dto/fixed-asset.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('fixed-assets')
@UseGuards(JwtAuthGuard)
export class FixedAssetsController {
  constructor(private readonly fixedAssetsService: FixedAssetsService) {}

  @Post()
  create(@Body() dto: CreateFixedAssetDto, @Req() req: any) {
    return this.fixedAssetsService.create({ ...dto, shopId: req.user.shopId });
  }

  @Get()
  findAll(@Req() req: any) {
    return this.fixedAssetsService.findAll(req.user.shopId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.fixedAssetsService.findOne(id, req.user.shopId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFixedAssetDto, @Req() req: any) {
    return this.fixedAssetsService.update(id, req.user.shopId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.fixedAssetsService.remove(id, req.user.shopId);
  }
}

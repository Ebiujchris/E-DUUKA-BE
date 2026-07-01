import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto, UpdateStaffDto } from './dto/staff.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('staff')
@UseGuards(JwtAuthGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  create(@Body() createStaffDto: CreateStaffDto, @Req() req: any) {
    return this.staffService.create({
      ...createStaffDto,
      shopId: req.user.shopId,
    });
  }

  @Get()
  findAll(@Req() req: any) {
    return this.staffService.findAll(req.user.shopId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.staffService.findOne(id, req.user.shopId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
    @Req() req: any,
  ) {
    return this.staffService.update(id, req.user.shopId, updateStaffDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.staffService.remove(id, req.user.shopId);
  }
}

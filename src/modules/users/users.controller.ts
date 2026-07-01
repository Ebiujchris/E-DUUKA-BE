import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getCurrentUser(@Req() req: any) {
    const authenticatedUserId = req.user?.id ?? req.user?.userId;
    return this.usersService.findOne(authenticatedUserId);
  }

  @Get('shop/all')
  @UseGuards(JwtAuthGuard)
  findShopUsers(@Req() req: any) {
    return this.usersService.findByShop(req.user.shopId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Req() req: any) {
    // Users can only view their own data or other users in their shop
    return this.usersService.findOneSecure(id, req.user.shopId, req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: any) {
    // Users can only update their own data
    if (id !== req.user.id) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req: any) {
    // Users cannot delete accounts through this endpoint
    throw new ForbiddenException('Account deletion is not allowed');
  }
}
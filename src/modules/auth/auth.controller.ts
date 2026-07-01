import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  login(@Body() loginDto: { phone: string; password: string }) {
    return this.authService.login(loginDto.phone, loginDto.password);
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: { phone: string }) {
    return this.authService.forgotPassword(body.phone);
  }

  @Post('reset-password')
  resetPassword(@Body() body: { phone: string; code: string; newPassword: string }) {
    return this.authService.resetPassword(body.phone, body.code, body.newPassword);
  }
}
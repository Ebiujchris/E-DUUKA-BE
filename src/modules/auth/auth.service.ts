import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findByPhone(createUserDto.phone);
    
    let user;
    let isNew = false;
    
    if (existingUser) {
      user = existingUser;
      isNew = false;
    } else {
      user = await this.usersService.create(createUserDto);
      isNew = true;
    }

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), isNew, token };
  }

  async login(phone: string, password: string) {
    const user = await this.usersService.findByPhone(phone);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('This account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  async forgotPassword(phone: string) {
    const user = await this.usersService.findByPhone(phone);
    
    if (!user) {
      throw new UnauthorizedException('Phone number not found');
    }

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry to 15 minutes from now
    const resetCodeExpiry = new Date();
    resetCodeExpiry.setMinutes(resetCodeExpiry.getMinutes() + 15);

    // Save reset code to user
    await this.usersService.updateResetCode(user.id, resetCode, resetCodeExpiry);

    // In production, send SMS here using Africa's Talking or similar service
    // For now, return the code (remove this in production!)
    return { 
      message: 'Reset code generated successfully',
      code: resetCode, // Remove this in production
      expiresIn: '15 minutes'
    };
  }

  async resetPassword(phone: string, code: string, newPassword: string) {
    const user = await this.usersService.findByPhone(phone);
    
    if (!user) {
      throw new UnauthorizedException('Phone number not found');
    }

    if (!user.resetCode || !user.resetCodeExpiry) {
      throw new UnauthorizedException('No reset code found. Please request a new one.');
    }

    if (user.resetCode !== code) {
      throw new UnauthorizedException('Invalid reset code');
    }

    if (new Date() > user.resetCodeExpiry) {
      throw new UnauthorizedException('Reset code has expired. Please request a new one.');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset code
    await this.usersService.updatePassword(user.id, hashedPassword);

    return { message: 'Password reset successfully' };
  }

  private generateToken(user: any) {
    const payload = {
      sub: user.id,
      id: user.id,
      phone: user.phone,
      shopId: user.shopId,
    };
    return this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  private sanitizeUser(user: any) {
    const sanitized = { ...user };
    delete sanitized.password;
    delete sanitized.resetCode;
    delete sanitized.resetCodeExpiry;
    return sanitized;
  }
}
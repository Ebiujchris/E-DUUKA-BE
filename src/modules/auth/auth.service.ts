import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { StaffService } from '../staff/staff.service';
import { CreateUserDto } from '../users/dto/user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private staffService: StaffService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findByPhone(createUserDto.phone);
    let user; let isNew = false;
    if (existingUser) { user = existingUser; }
    else { user = await this.usersService.create(createUserDto); isNew = true; }
    const token = this.generateOwnerToken(user);
    return { user: this.sanitizeUser(user), isNew, token };
  }

  async login(phone: string, password: string) {
    const phonesToTry = this.normalizePhoneVariants(phone);

    // Try owner first
    for (const p of phonesToTry) {
      const owner = await this.usersService.findByPhone(p);
      if (owner) {
        if (!owner.isActive) throw new UnauthorizedException('This account is inactive');
        if (!owner.password) throw new UnauthorizedException('Account has no password set');
        const valid = await bcrypt.compare(password, owner.password);
        if (!valid) throw new UnauthorizedException('Invalid credentials');
        return { user: this.buildOwnerProfile(owner), token: this.generateOwnerToken(owner) };
      }
    }

    // Try staff
    for (const p of phonesToTry) {
      const staff = await this.staffService.findByPhone(p);
      if (staff) {
        if (staff.status !== 'active') throw new UnauthorizedException('This staff account is inactive');
        if (!staff.password) throw new UnauthorizedException('Staff account has no password. Ask the owner to set one.');
        const valid = await bcrypt.compare(password, staff.password);
        if (!valid) throw new UnauthorizedException('Invalid credentials');
        return { user: this.buildStaffProfile(staff), token: this.generateStaffToken(staff) };
      }
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  private normalizePhoneVariants(phone: string): string[] {
    const trimmed = phone.trim();
    const variants = new Set<string>();
    variants.add(trimmed);
    if (trimmed.startsWith('+256')) {
      variants.add('0' + trimmed.slice(4));
      variants.add(trimmed.slice(1));
    }
    if (trimmed.startsWith('0')) {
      variants.add('+256' + trimmed.slice(1));
      variants.add('256' + trimmed.slice(1));
    }
    if (trimmed.startsWith('256') && !trimmed.startsWith('+')) {
      variants.add('+' + trimmed);
      variants.add('0' + trimmed.slice(3));
    }
    return [...variants];
  }

  async forgotPassword(phone: string) {
    const user = await this.usersService.findByPhone(phone);
    if (!user) throw new UnauthorizedException('Phone number not found');
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpiry = new Date();
    resetCodeExpiry.setMinutes(resetCodeExpiry.getMinutes() + 15);
    await this.usersService.updateResetCode(user.id, resetCode, resetCodeExpiry);
    return { message: 'Reset code generated successfully', code: resetCode, expiresIn: '15 minutes' };
  }

  async resetPassword(phone: string, code: string, newPassword: string) {
    const user = await this.usersService.findByPhone(phone);
    if (!user) throw new UnauthorizedException('Phone number not found');
    if (!user.resetCode || !user.resetCodeExpiry) throw new UnauthorizedException('No reset code found.');
    if (user.resetCode !== code) throw new UnauthorizedException('Invalid reset code');
    if (new Date() > user.resetCodeExpiry) throw new UnauthorizedException('Reset code has expired.');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(user.id, hashedPassword);
    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersService.findByPhone(
      (await this.usersService.findOne(userId)).phone,
    );
    if (!user) throw new UnauthorizedException('User not found');
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');
    if (newPassword.length < 6) throw new UnauthorizedException('New password must be at least 6 characters');
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(userId, hashed);
    return { message: 'Password changed successfully' };
  }

  // ── Token generators ─────────────────────────────────────────────────────

  private generateOwnerToken(user: any) {
    return this.jwtService.sign({
      sub: user.id, id: user.id, phone: user.phone,
      name: user.name, shopId: user.shopId, type: 'owner',
    }, { expiresIn: '30d', secret: process.env.JWT_SECRET || 'your-secret-key' });
  }

  private generateStaffToken(staff: any) {
    return this.jwtService.sign({
      sub: staff.id, id: staff.id, phone: staff.phone,
      shopId: staff.shopId, type: 'staff', role: staff.role,
      permissions: {
        canViewDashboard:   staff.canViewDashboard   ?? true,
        canMakeSales:       staff.canMakeSales        ?? true,
        canAccessInventory: staff.canAccessInventory  ?? false,
        canApproveCredits:  staff.canApproveCredits   ?? false,
        canManageExpenses:  staff.canManageExpenses   ?? false,
        canViewReports:     staff.canViewReports      ?? false,
        pagePermissions:    {},
      },
    }, { expiresIn: '30d', secret: process.env.JWT_SECRET || 'your-secret-key' });
  }

  // ── Profile builders ─────────────────────────────────────────────────────

  private buildOwnerProfile(user: any) {
    return {
      id: user.id, name: user.name, phone: user.phone,
      email: user.email, shopId: user.shopId,
      accountType: 'owner' as const, role: 'owner',
      permissions: { canAccessInventory: true, canApproveCredits: true, canViewReports: true, pagePermissions: {} },
    };
  }

  private buildStaffProfile(staff: any) {
    return {
      id: staff.id, name: staff.name, phone: staff.phone,
      shopId: staff.shopId, accountType: 'staff' as const, role: staff.role,
      permissions: {
        canViewDashboard:   staff.canViewDashboard   ?? true,
        canMakeSales:       staff.canMakeSales        ?? true,
        canAccessInventory: staff.canAccessInventory  ?? false,
        canApproveCredits:  staff.canApproveCredits   ?? false,
        canManageExpenses:  staff.canManageExpenses   ?? false,
        canViewReports:     staff.canViewReports      ?? false,
        pagePermissions:    {},
      },
    };
  }

  private sanitizeUser(user: any) {
    const s = { ...user };
    delete s.password; delete s.resetCode; delete s.resetCodeExpiry;
    return s;
  }
}

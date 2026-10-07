import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { StaffService } from '../staff/staff.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly staffService: StaffService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.sub).catch(() => null);
    if (user && user.isActive) {
      return {
        id: user.id,
        userId: user.id,
        shopId: user.shopId,
        phone: user.phone,
        name: user.name,
        accountType: 'owner',
        role: 'owner',
        permissions: {
          canViewDashboard: true,
          canMakeSales: true,
          canAccessInventory: true,
          canApproveCredits: true,
          canManageExpenses: true,
          canViewReports: true,
        },
      };
    }

    const staff = payload.shopId
      ? await this.staffService.findOne(payload.sub, payload.shopId).catch(() => null)
      : null;

    if (staff && staff.status === 'active') {
      return {
        id: staff.id,
        userId: staff.id,
        shopId: staff.shopId,
        phone: staff.phone,
        name: staff.name,
        accountType: 'staff',
        role: staff.role,
        permissions: {
          canViewDashboard: staff.canViewDashboard ?? true,
          canMakeSales: staff.canMakeSales ?? true,
          canAccessInventory: staff.canAccessInventory ?? false,
          canApproveCredits: staff.canApproveCredits ?? false,
          canManageExpenses: staff.canManageExpenses ?? false,
          canViewReports: staff.canViewReports ?? false,
        },
      };
    }

    throw new UnauthorizedException('Invalid or inactive user session');
  }
}

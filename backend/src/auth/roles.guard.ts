import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are specified, allow access (let JwtAuthGuard handle it)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log('🔍 RolesGuard - request.user:', user);
    console.log('🔍 RolesGuard - request.headers:', request.headers);

    // If no user, deny access
    if (!user) {
      console.error('❌ No user in request object');
      throw new ForbiddenException('Unauthorized - No user found');
    }

    // Check if user role is in required roles
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      console.warn(`🚫 Access Denied: User ${user.id} with role '${user.role}' tried to access route requiring ${requiredRoles.join(', ')}`);
      throw new ForbiddenException(`Access denied. Required roles: ${requiredRoles.join(', ')}`);
    }

    console.log(`✅ Access Granted: User ${user.id} with role '${user.role}' accessing route`);
    return true;
  }
}


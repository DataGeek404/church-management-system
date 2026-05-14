import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../auth/entities/user.entity';
import {
  CreateUserDto,
  UpdateUserDto,
  ToggleUserStatusDto,
  ListUsersQueryDto,
} from '../auth/dto/user-management.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Get all users with filtering
   */
  async getAllUsers(query: ListUsersQueryDto) {
    let queryBuilder = this.usersRepository.createQueryBuilder('user');

    // Search by email or name
    if (query.search) {
      queryBuilder = queryBuilder.where(
        'user.email LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search',
        { search: `%${query.search}%` },
      );
    }

    // Filter by role
    if (query.role && query.role !== 'all') {
      queryBuilder = queryBuilder.andWhere('user.role = :role', { role: query.role });
    }

    // Filter by status
    if (query.status && query.status !== 'all') {
      queryBuilder = queryBuilder.andWhere('user.status = :status', { status: query.status });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply limit
    if (query.limit) {
      queryBuilder = queryBuilder.limit(query.limit);
    }

    // Fetch users
    const users = await queryBuilder.select([
      'user.id',
      'user.firstName',
      'user.lastName',
      'user.email',
      'user.role',
      'user.status',
      'user.createdDate',
      'user.updatedDate',
    ]).getMany();

    return {
      success: true,
      data: users,
      total,
      limit: query.limit || null,
    };
  }

  /**
   * Get single user by ID
   */
  async getUserById(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'firstName', 'lastName', 'email', 'role', 'status', 'createdDate', 'updatedDate'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      data: user,
    };
  }

  /**
   * Get user statistics
   */
  async getUserStatistics() {
    const [users, total] = await this.usersRepository.findAndCount();

    const stats = {
      total,
      active: users.filter((u) => u.status === 'active').length,
      inactive: users.filter((u) => u.status === 'inactive').length,
      admins: users.filter((u) => u.role === 'admin').length,
      staff: users.filter((u) => u.role === 'staff').length,
      members: users.filter((u) => u.role === 'member').length,
    };

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Create new user
   */
  async createUser(createUserDto: CreateUserDto, requestUser: any) {

    // Check if user is admin
    if (requestUser.role !== 'admin') {
      throw new ForbiddenException('Only admins can create users');
    }

    // Check if email already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create new user
    const newUser = this.usersRepository.create({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      email: createUserDto.email,
      password: hashedPassword,
      role: createUserDto.role || 'member',
      status: 'active',
    });

    const savedUser = await this.usersRepository.save(newUser);

    // Remove password from response
    const { password, ...userWithoutPassword } = savedUser;

    return {
      success: true,
      data: userWithoutPassword,
      message: 'User created successfully',
    };
  }

  /**
   * Update user
   */
  async updateUser(userId: string, updateUserDto: UpdateUserDto, requestUser: any) {
    // Check if user exists
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check permissions: only admin or self can update
    if (requestUser.role !== 'admin' && requestUser.id !== userId) {
      throw new ForbiddenException('You can only update your own profile');
    }

    // Update basic fields
    if (updateUserDto.firstName && updateUserDto.firstName.trim()) {
      user.firstName = updateUserDto.firstName.trim();
    }
    if (updateUserDto.lastName && updateUserDto.lastName.trim()) {
      user.lastName = updateUserDto.lastName.trim();
    }
    if (updateUserDto.email && updateUserDto.email.trim()) {
      const newEmail = updateUserDto.email.trim().toLowerCase();
      if (newEmail !== user.email) {
        // Check if new email is already in use
        const existingUser = await this.usersRepository.findOne({
          where: { email: newEmail },
        });
        if (existingUser) {
          throw new BadRequestException('Email already in use');
        }
        user.email = newEmail;
      }
    }

    // Only admin can update role and status
    if (requestUser.role === 'admin') {
      if (updateUserDto.role && ['admin', 'staff', 'member', 'user'].includes(updateUserDto.role)) {
        user.role = updateUserDto.role;
      }
      if (updateUserDto.status && ['active', 'inactive'].includes(updateUserDto.status)) {
        user.status = updateUserDto.status;
      }
    }

    // Handle password change (only self or admin can change, and only with newPassword field)
    if (updateUserDto.newPassword && updateUserDto.newPassword.trim()) {
      if (requestUser.role !== 'admin' && requestUser.id !== userId) {
        throw new ForbiddenException('You can only change your own password');
      }
      const hashedPassword = await bcrypt.hash(updateUserDto.newPassword.trim(), 10);
      user.password = hashedPassword;
    }

    const updatedUser = await this.usersRepository.save(user);
    const { password, ...userWithoutPassword } = updatedUser;

    return {
      success: true,
      data: userWithoutPassword,
      message: 'User updated successfully',
    };
  }

  /**
   * Toggle user status
   */
  async toggleUserStatus(userId: string, toggleStatusDto: ToggleUserStatusDto, requestUser: any) {

    // Check if user is admin
    if (requestUser.role !== 'admin') {
      throw new ForbiddenException('Only admins can toggle user status');
    }

    // Check if user exists
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update status
    user.status = toggleStatusDto.status || (user.status === 'active' ? 'inactive' : 'active');
    const updatedUser = await this.usersRepository.save(user);

    return {
      success: true,
      data: updatedUser,
      message: `User status changed to ${updatedUser.status}`,
    };
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string, requestUser: any) {

    // Check if user is admin
    if (requestUser.role !== 'admin') {
      throw new ForbiddenException('Only admins can delete users');
    }

    // Check if user exists
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent deleting yourself
    if (requestUser.id === userId) {
      throw new BadRequestException('You cannot delete your own account');
    }

    // Delete user
    await this.usersRepository.delete(userId);

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, changePasswordDto: any, requestUser: any) {

    // Check if user exists
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check permissions: only admin or self can change password
    if (requestUser.role !== 'admin' && requestUser.id !== userId) {
      throw new ForbiddenException('You can only change your own password');
    }

    // If user is changing own password, verify old password
    if (requestUser.id === userId) {
      const isOldPasswordValid = await bcrypt.compare(changePasswordDto.oldPassword, user.password);
      if (!isOldPasswordValid) {
        throw new UnauthorizedException('Old password is incorrect');
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.password = hashedPassword;

    await this.usersRepository.save(user);

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }
}


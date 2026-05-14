import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  ToggleUserStatusDto,
  ListUsersQueryDto,
} from '../auth/dto/user-management.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('User Management')
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  /**
   * Get user statistics
   * GET /api/users/stats
   */
  @Get('stats')
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Get user statistics - Admin/Staff only' })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          total: 10,
          active: 8,
          admins: 2,
          staff: 5,
        },
      },
    },
  })
  async getUserStatistics() {
    return this.usersService.getUserStatistics();
  }

  /**
   * Get all users with search, role, and status filters
   * GET /api/users
   */
  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all users with filters - Admin only' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by email or name' })
  @ApiQuery({ name: 'role', required: false, enum: ['admin', 'staff', 'member'] })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive'] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 'uuid',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            role: 'admin',
            status: 'active',
          },
        ],
        total: 1,
        limit: 100,
      },
    },
  })
  async getAllUsers(@Query() query: ListUsersQueryDto) {
    return this.usersService.getAllUsers(query);
  }

  /**
   * Get current user profile
   * GET /api/users/profile
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Current user profile retrieved successfully',
  })
  async getProfile(@Request() req: any) {
    return this.usersService.getUserById(req.user.id);
  }

  /**
   * Update current user profile
   * PUT /api/users/profile
   */
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
  })
  async updateProfile(@Body() updateUserDto: UpdateUserDto, @Request() req: any) {
    return this.usersService.updateUser(req.user.id, updateUserDto, req.user);
  }

  /**
   * Get single user by ID - admin only or own profile
   * GET /api/users/:id
   */
  @Get(':id')
  @Roles('admin', 'staff', 'member')
  @ApiOperation({ summary: 'Get user by ID - Admin/Staff or own profile' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: 'uuid',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: 'admin',
          status: 'active',
        },
      },
    },
  })
  async getUserById(@Param('id') userId: string, @Request() req: any) {
    // Check if user is viewing their own profile or is admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return {
        success: false,
        message: 'Access denied. You can only view your own profile or be an admin.',
      };
    }
    return this.usersService.getUserById(userId);
  }

  /**
   * Create new user (admin only)
   * POST /api/users
   */
  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new user - Admin only' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  async createUser(@Body() createUserDto: CreateUserDto, @Request() req: any) {
    return this.usersService.createUser(createUserDto, req.user);
  }

  /**
   * Update user (admin or own profile)
   * PUT /api/users/:id
   */
  @Put(':id')
  @Roles('admin', 'staff', 'member')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user - Admin or own profile' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
  })
  async updateUser(
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any,
  ) {
    // Check if user is updating their own profile or is admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return {
        success: false,
        message: 'Access denied. You can only update your own profile.',
      };
    }
    return this.usersService.updateUser(userId, updateUserDto, req.user);
  }

  /**
   * Toggle user status (active/inactive)
   * PATCH /api/users/:id/status
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle user status - Admin only' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User status toggled successfully',
  })
  async toggleUserStatus(
    @Param('id') userId: string,
    @Body() toggleStatusDto: ToggleUserStatusDto,
    @Request() req: any,
  ) {
    return this.usersService.toggleUserStatus(userId, toggleStatusDto, req.user);
  }

  /**
   * Delete user (admin only)
   * DELETE /api/users/:id
   */
  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user - Admin only' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  async deleteUser(@Param('id') userId: string, @Request() req: any) {
    return this.usersService.deleteUser(userId, req.user);
  }

  /**
   * Change user password
   * POST /api/users/:id/change-password
   */
  @Post(':id/change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change user password' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async changePassword(
    @Param('id') userId: string,
    @Body() changePasswordDto: any,
    @Request() req: any,
  ) {
    return this.usersService.changePassword(userId, changePasswordDto, req.user);
  }
}


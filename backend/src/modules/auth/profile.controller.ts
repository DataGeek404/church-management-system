import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ProfileService } from './profile.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto/profile.dto';

@Controller('profile')
@UseGuards(JwtAuthGuard)
@ApiTags('User Profile')
@ApiBearerAuth()
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  /**
   * Get current user's profile
   * GET /api/profile
   */
  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
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
  async getProfile(@Request() req) {
    return this.profileService.getProfile(req.user.id);
  }

  /**
   * Update current user's profile
   * PUT /api/profile
   */
  @Put()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Profile updated successfully',
      },
    },
  })
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(req.user.id, updateProfileDto);
  }

  /**
   * Change current user's password
   * POST /api/profile/change-password
   */
  @Post('change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    schema: {
      example: {
        success: true,
        message: 'Password changed successfully',
      },
    },
  })
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.profileService.changePassword(req.user.id, changePasswordDto);
  }
}


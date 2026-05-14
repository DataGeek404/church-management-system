import { Controller, Get, Post, Body, Put, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { CreateMemberDto, UpdateMemberDto } from './dto/member.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('Members')
@Controller('members')
export class MembersController {
  constructor(private membersService: MembersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new member' })
  async create(@Body() createMemberDto: CreateMemberDto) {
    const result = await this.membersService.create(createMemberDto);
    return {
      success: true,
      data: result,
      message: 'Member created successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all members' })
  async findAll(@Query('status') status?: string) {
    const members = await this.membersService.findAll(status);
    return {
      success: true,
      data: members,
      total: members.length,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get member statistics' })
  async getStats() {
    const stats = await this.membersService.getStats();
    return {
      success: true,
      data: stats,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get member by ID' })
  async findOne(@Param('id') id: string) {
    const member = await this.membersService.findOne(id);
    return {
      success: true,
      data: member,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update member' })
  async update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
    const result = await this.membersService.update(id, updateMemberDto);
    return {
      success: true,
      data: result,
      message: 'Member updated successfully',
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete member' })
  async remove(@Param('id') id: string) {
    const result = await this.membersService.remove(id);
    return {
      success: true,
      data: result,
      message: 'Member deleted successfully',
    };
  }
}


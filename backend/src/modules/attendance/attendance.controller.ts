import { Controller, Get, Post, Put, Delete, Query, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('Attendance')
@Controller('attendance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  getHello() {
    return { message: 'Attendance Service' };
  }

  @Get('records')
  @ApiOperation({ summary: 'Get attendance records' })
  async getRecords(@Query('limit') limit?: string | number) {
    const parsedLimit = limit ? parseInt(String(limit), 10) : 100;
    return await this.attendanceService.getRecords(parsedLimit);
  }

  @Get('records/:id')
  @ApiOperation({ summary: 'Get attendance record by ID' })
  async getRecordById(@Param('id') id: string) {
    return await this.attendanceService.getRecordById(id);
  }

  @Post('records')
  @ApiOperation({ summary: 'Record attendance' })
  async recordAttendance(@Body() data: any) {
    return await this.attendanceService.recordAttendance(data);
  }

  @Put('records/:id')
  @ApiOperation({ summary: 'Update attendance record' })
  async updateRecord(@Param('id') id: string, @Body() data: any) {
    return await this.attendanceService.updateRecord(id, data);
  }

  @Delete('records/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete attendance record' })
  async deleteRecord(@Param('id') id: string) {
    return await this.attendanceService.deleteRecord(id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get attendance statistics' })
  async getStats() {
    return await this.attendanceService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attendance by ID (legacy)' })
  async getOne(@Param('id') id: string) {
    return await this.attendanceService.getOne(id);
  }
}

import { Controller, Get, Post, Body, Query, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';

@ApiTags('Reports')
@Controller('reporting')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  getHello() {
    return this.reportsService.getHello();
  }

  @Get('summary')
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Get reports summary - Admin/Staff only' })
  getSummary() {
    return this.reportsService.getSummary();
  }

  @Get('analytics')
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Get analytics data - Admin/Staff only' })
  getAnalytics(@Query('period') period: string = 'monthly') {
    return this.reportsService.getAnalytics(period);
  }

  @Get('reports')
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Get all reports - Admin/Staff only' })
  async getReports(@Query('type') type?: string) {
    return await this.reportsService.getReports(type);
  }

  @Post('reports/generate')
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Generate report - Admin/Staff only' })
  async generateReport(@Body() data: any) {
    return await this.reportsService.generateReport(data);
  }

  @Get('reports/:id')
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Get report by ID - Admin/Staff only' })
  async getReport(@Param('id') id: string) {
    return await this.reportsService.getReport(id);
  }

  @Post('reports/:id/export')
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Export report - Admin/Staff only' })
  async exportReport(@Param('id') id: string, @Query('format') format: string = 'json') {
    const validFormats = ['json', 'csv', 'pdf'];
    if (!validFormats.includes(format.toLowerCase())) {
      throw new BadRequestException(`Invalid format. Supported formats: ${validFormats.join(', ')}`);
    }
    return await this.reportsService.exportReport(id, format);
  }

  @Post('reports/:id/delete')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete report - Admin only' })
  async deleteReport(@Param('id') id: string) {
    return await this.reportsService.deleteReport(id);
  }
}

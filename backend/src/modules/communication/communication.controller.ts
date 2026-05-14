import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommunicationService } from './communication.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('Communication')
@Controller('communication')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommunicationController {
  constructor(private readonly communicationService: CommunicationService) {}

  @Get()
  getHello() {
    return this.communicationService.getHello();
  }

  @Get('messages')
  @ApiOperation({ summary: 'Get messages' })
  async getMessages(@Query('limit') limit?: string | number) {
    const parsedLimit = limit ? parseInt(String(limit), 10) : 100;
    return await this.communicationService.getMessages(parsedLimit);
  }

  @Get('messages/:id')
  @ApiOperation({ summary: 'Get message by ID' })
  async getMessageById(@Param('id') id: string) {
    return await this.communicationService.getMessageById(id);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send messages' })
  async sendMessages(@Body() data: any) {
    return await this.communicationService.sendMessages(data);
  }

  @Put('messages/:id')
  @ApiOperation({ summary: 'Update message' })
  async updateMessage(@Param('id') id: string, @Body() data: any) {
    return await this.communicationService.updateMessage(id, data);
  }

  @Delete('messages/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete message' })
  async deleteMessage(@Param('id') id: string) {
    return await this.communicationService.deleteMessage(id);
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Get notifications' })
  getNotifications(@Query('limit') limit: number = 10) {
    return this.communicationService.getNotifications(limit);
  }

  @Post('notifications/bulk')
  @ApiOperation({ summary: 'Send bulk notifications' })
  sendBulkNotifications(@Body() data: any) {
    return this.communicationService.sendBulkNotification(data);
  }
}

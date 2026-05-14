import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Get events' })
  async getEvents(@Query('limit') limit?: number) {
    const limitValue = limit ? parseInt(String(limit), 10) : 100;
    return await this.eventsService.getEvents(limitValue);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new event' })
  async createEvent(@Body() createEventDto: any) {
    return await this.eventsService.createEvent(createEventDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  async getEvent(@Param('id') id: string) {
    return await this.eventsService.getEvent(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update event' })
  async updateEvent(@Param('id') id: string, @Body() updateEventDto: any) {
    return await this.eventsService.updateEvent(id, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete event' })
  async deleteEvent(@Param('id') id: string) {
    return await this.eventsService.deleteEvent(id);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Event } from './entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {
    // Seed sample events on initialization
    this.initializeSampleEvents();
  }

  private async initializeSampleEvents() {
    try {
      const existingCount = await this.eventRepository.count();

      if (existingCount === 0) {
        const now = new Date();
        const sampleEvents = [
          {
            id: uuid(),
            title: 'Sunday Service',
            type: 'Service',
            date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
            location: 'Main Church Hall',
            capacity: 200,
            attendees: 0,
            description:
              'Weekly Sunday service with worship, prayer, and teaching.',
            status: 'Scheduled',
          },
          {
            id: uuid(),
            title: 'Bible Study',
            type: 'Study',
            date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
            location: 'Church Library',
            capacity: 50,
            attendees: 0,
            description: 'Mid-week Bible study group. Everyone welcome!',
            status: 'Scheduled',
          },
          {
            id: uuid(),
            title: 'Youth Group Meeting',
            type: 'Meeting',
            date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
            location: 'Youth Center',
            capacity: 100,
            attendees: 0,
            description:
              'Fun activities, games, and fellowship for youth members.',
            status: 'Scheduled',
          },
          {
            id: uuid(),
            title: 'Prayer & Praise Night',
            type: 'Service',
            date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
            location: 'Main Church Hall',
            capacity: 300,
            attendees: 0,
            description: 'Special evening of worship, prayer, and praise.',
            status: 'Scheduled',
          },
          {
            id: uuid(),
            title: 'Coffee & Fellowship',
            type: 'Social',
            date: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
            location: 'Church Cafe',
            capacity: 80,
            attendees: 0,
            description:
              'Casual gathering for coffee and community building.',
            status: 'Scheduled',
          },
        ];

        for (const eventData of sampleEvents) {
          const event = this.eventRepository.create(eventData);
          await this.eventRepository.save(event);
        }
      }
    } catch (error) {
      // Silently handle errors during initialization
    }
  }

  async getEvents(limit: number = 100) {
    const events = await this.eventRepository.find({
      order: {
        createdAt: 'DESC',
      },
      take: limit,
    });

    const total = await this.eventRepository.count();

    return {
      success: true,
      data: events,
      total,
      limit,
    };
  }

  async createEvent(createEventDto: any): Promise<any> {
    const newEvent = new Event();
    newEvent.id = uuid();
    newEvent.title = createEventDto.title;
    newEvent.type = createEventDto.type;
    newEvent.date = new Date(createEventDto.date);
    newEvent.location = createEventDto.location;
    newEvent.capacity = createEventDto.capacity;
    newEvent.description = createEventDto.description;
    newEvent.status = createEventDto.status || 'Scheduled';
    newEvent.attendees = 0;

    const savedEvent = await this.eventRepository.save(newEvent);

    return {
      success: true,
      data: savedEvent,
      message: 'Event created successfully',
    };
  }

  async getEvent(id: string): Promise<any> {
    const event = await this.eventRepository.findOne({ where: { id } });

    return {
      success: !!event,
      data: event || null,
      message: event ? 'Event found' : 'Event not found',
    };
  }

  async updateEvent(id: string, updateEventDto: any): Promise<any> {
    await this.eventRepository.update(id, updateEventDto);
    const updatedEvent = await this.eventRepository.findOne({ where: { id } });


    return {
      success: !!updatedEvent,
      data: updatedEvent,
      message: updatedEvent ? 'Event updated successfully' : 'Event not found',
    };
  }

  async deleteEvent(id: string): Promise<any> {
    const event = await this.eventRepository.findOne({ where: { id } });

    if (!event) {
      return {
        success: false,
        message: 'Event not found',
      };
    }

    await this.eventRepository.delete(id);

    return {
      success: true,
      message: 'Event deleted successfully',
    };
  }

  async getEventStats(): Promise<any> {

    const total = await this.eventRepository.count();
    const upcomingCount = await this.eventRepository.count({
      where: {
        date: new Date(),
      },
    });

    return {
      success: true,
      data: {
        total,
        upcoming: upcomingCount,
        past: total - upcomingCount,
      },
    };
  }
}

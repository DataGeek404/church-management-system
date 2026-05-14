import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Message } from './entities/message.entity';

@Injectable()
export class CommunicationService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  getHello() {
    return { message: 'Communication Service' };
  }

  async getMessages(limit: number = 100) {
    console.log(`💬 Getting messages with limit: ${limit}`);

    const messages = await this.messageRepository.find({
      order: {
        sentTime: 'DESC',
      },
      take: limit,
    });

    const total = await this.messageRepository.count();

    console.log(`💬 Retrieved ${messages.length} messages from database`);

    return {
      success: true,
      data: messages,
      total,
      limit,
    };
  }

  async getMessageById(id: string) {
    console.log(`💬 Getting message: ${id}`);

    const message = await this.messageRepository.findOne({ where: { id } });

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    return {
      success: true,
      data: message,
    };
  }

  async sendMessages(data: any) {
    console.log('💬 Sending messages:', data);

    const recipientIds = Array.isArray(data.recipientIds)
      ? data.recipientIds
      : (data.recipientIds ? [data.recipientIds] : [data.recipientId ? [data.recipientId] : []]);

    const messages = [];

    for (const recipientId of recipientIds) {
      const message = this.messageRepository.create({
        id: uuid(),
        recipientId,
        subject: data.subject,
        body: data.body,
        type: data.type || 'notification',
        status: 'Sent',
        sentTime: new Date(),
      });

      const savedMessage = await this.messageRepository.save(message);
      messages.push(savedMessage);
      console.log('✅ Message saved to database:', savedMessage.id);
    }

    return {
      success: true,
      data: messages,
      message: `${messages.length} message(s) sent successfully`,
    };
  }

  async updateMessage(id: string, data: any) {
    console.log(`💬 Updating message: ${id}`);

    const message = await this.messageRepository.findOne({ where: { id } });

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    if (data.recipientId) message.recipientId = data.recipientId;
    if (data.subject) message.subject = data.subject;
    if (data.body) message.body = data.body;
    if (data.type) message.type = data.type;
    if (data.status) message.status = data.status;
    if (data.sentTime) message.sentTime = new Date(data.sentTime);

    const updatedMessage = await this.messageRepository.save(message);
    console.log(`✅ Message updated: ${updatedMessage.id}`);

    return {
      success: true,
      data: updatedMessage,
      message: 'Message updated successfully',
    };
  }

  async deleteMessage(id: string) {
    console.log(`💬 Deleting message: ${id}`);

    const message = await this.messageRepository.findOne({ where: { id } });

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    await this.messageRepository.remove(message);
    console.log(`✅ Message deleted: ${id}`);

    return {
      success: true,
      message: 'Message deleted successfully',
    };
  }

  async getNotifications(limit: number = 100) {
    console.log(`💬 Getting notifications with limit: ${limit}`);

    const notifications = await this.messageRepository.find({
      where: { type: 'notification' },
      order: { sentTime: 'DESC' },
      take: limit,
    });

    return {
      success: true,
      data: notifications,
      total: notifications.length,
      limit,
    };
  }

  async sendBulkNotification(data: any) {
    console.log('💬 Sending bulk notification:', data);

    const recipientIds = Array.isArray(data.recipientIds)
      ? data.recipientIds
      : (data.recipientIds ? [data.recipientIds] : []);

    const messages = [];

    for (const recipientId of recipientIds) {
      const message = this.messageRepository.create({
        id: uuid(),
        recipientId,
        subject: data.subject || 'Notification',
        body: data.body || data.message,
        type: 'notification',
        status: 'Sent',
        sentTime: new Date(),
      });

      const savedMessage = await this.messageRepository.save(message);
      messages.push(savedMessage);
    }

    console.log(`✅ ${messages.length} bulk notifications saved to database`);

    return {
      success: true,
      data: {
        messageCount: messages.length,
        recipientCount: recipientIds.length,
        sentTime: new Date().toISOString(),
      },
      message: 'Bulk notification sent successfully',
    };
  }

  async getStats() {
    console.log('💬 Getting communication statistics');

    const total = await this.messageRepository.count();
    const sent = await this.messageRepository.count({
      where: { status: 'Sent' },
    });

    return {
      success: true,
      data: {
        totalMessages: total,
        sentMessages: sent,
        messageRate: total > 0 ? ((sent / total) * 100).toFixed(2) + '%' : '0%',
      },
    };
  }
}


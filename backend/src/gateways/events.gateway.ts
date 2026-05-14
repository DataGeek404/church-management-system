import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('events:create')
  async handleCreateEvent(client: Socket, data: any) {
    this.logger.log(`Create event: ${JSON.stringify(data)}`);
    try {
      // Emit success to all clients
      this.server.emit('events:created', {
        success: true,
        data,
        message: 'Event created successfully',
      });
    } catch (error) {
      client.emit('events:error', {
        success: false,
        message: error.message,
      });
    }
  }

  @SubscribeMessage('events:fetch')
  async handleFetchEvents(client: Socket, data: any) {
    this.logger.log(`Fetch events: ${JSON.stringify(data)}`);
    try {
      client.emit('events:fetched', {
        success: true,
        data: [],
        message: 'Events fetched successfully',
      });
    } catch (error) {
      client.emit('events:error', {
        success: false,
        message: error.message,
      });
    }
  }

  @SubscribeMessage('events:update')
  async handleUpdateEvent(client: Socket, data: any) {
    this.logger.log(`Update event: ${JSON.stringify(data)}`);
    try {
      this.server.emit('events:updated', {
        success: true,
        data,
        message: 'Event updated successfully',
      });
    } catch (error) {
      client.emit('events:error', {
        success: false,
        message: error.message,
      });
    }
  }

  @SubscribeMessage('events:delete')
  async handleDeleteEvent(client: Socket, data: any) {
    this.logger.log(`Delete event: ${JSON.stringify(data)}`);
    try {
      this.server.emit('events:deleted', {
        success: true,
        data,
        message: 'Event deleted successfully',
      });
    } catch (error) {
      client.emit('events:error', {
        success: false,
        message: error.message,
      });
    }
  }

  // Generic API call handler
  @SubscribeMessage('api:call')
  async handleApiCall(client: Socket, data: { endpoint: string; method: string; payload?: any }) {
    this.logger.log(`API Call: ${data.method} ${data.endpoint}`);
    try {
      // Emit response to the client
      client.emit('api:response', {
        success: true,
        endpoint: data.endpoint,
        method: data.method,
        data: {},
      });
    } catch (error) {
      client.emit('api:error', {
        success: false,
        endpoint: data.endpoint,
        message: error.message,
      });
    }
  }

  // Broadcast to all clients
  broadcastEvent(event: string, data: any) {
    this.server.emit(event, data);
  }

  // Send to specific client
  sendToClient(clientId: string, event: string, data: any) {
    this.server.to(clientId).emit(event, data);
  }
}


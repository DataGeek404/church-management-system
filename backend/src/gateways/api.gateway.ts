import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Inject } from '@nestjs/common';
import { EventsService } from '../modules/events/events.service';
import { MembersService } from '../modules/members/members.service';
import { AttendanceService } from '../modules/attendance/attendance.service';
import { FinancialService } from '../modules/financial/financial.service';
import { CommunicationService } from '../modules/communication/communication.service';
import { ReportsService } from '../modules/reports/reports.service';
import { LogsService } from '../modules/logs/logs.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'api',
})
export class ApiGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ApiGateway');

  constructor(
    private eventsService: EventsService,
    private membersService: MembersService,
    private attendanceService: AttendanceService,
    private financialService: FinancialService,
    private communicationService: CommunicationService,
    private reportsService: ReportsService,
    private logsService: LogsService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('API WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connection', { message: 'Connected to API Gateway', clientId: client.id });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Events endpoints
  @SubscribeMessage('events:list')
  async handleListEvents(client: Socket, data: { limit?: number }) {
    try {
      const result = this.eventsService.getEvents(data?.limit || 100);
      client.emit('events:list:response', result);
      this.server.emit('events:list:broadcast', result);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('events:create')
  async handleCreateEvent(client: Socket, data: any) {
    try {
      const result = this.eventsService.createEvent(data);
      this.server.emit('events:created', result);
      client.emit('events:create:response', result);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('events:get')
  async handleGetEvent(client: Socket, data: { id: string }) {
    try {
      const result = this.eventsService.getEvent(data.id);
      client.emit('events:get:response', result);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('events:update')
  async handleUpdateEvent(client: Socket, data: { id: string; [key: string]: any }) {
    try {
      const { id, ...updateData } = data;
      const result = this.eventsService.updateEvent(id, updateData);
      this.server.emit('events:updated', result);
      client.emit('events:update:response', result);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('events:delete')
  async handleDeleteEvent(client: Socket, data: { id: string }) {
    try {
      const result = this.eventsService.deleteEvent(data.id);
      this.server.emit('events:deleted', result);
      client.emit('events:delete:response', result);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // Members endpoints
  @SubscribeMessage('members:list')
  async handleListMembers(client: Socket, data: { status?: string }) {
    try {
      const result = await this.membersService.findAll(data?.status);
      client.emit('members:list:response', {
        success: true,
        data: result,
        total: result.length,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('members:create')
  async handleCreateMember(client: Socket, data: any) {
    try {
      const result = await this.membersService.create(data);
      this.server.emit('members:created', {
        success: true,
        data: result,
        message: 'Member created successfully',
      });
      client.emit('members:create:response', {
        success: true,
        data: result,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('members:get')
  async handleGetMember(client: Socket, data: { id: string }) {
    try {
      const result = await this.membersService.findOne(data.id);
      client.emit('members:get:response', {
        success: true,
        data: result,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('members:update')
  async handleUpdateMember(client: Socket, data: { id: string; [key: string]: any }) {
    try {
      const { id, ...updateData } = data;
      const result = await this.membersService.update(id, updateData);
      this.server.emit('members:updated', {
        success: true,
        data: result,
      });
      client.emit('members:update:response', {
        success: true,
        data: result,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('members:delete')
  async handleDeleteMember(client: Socket, data: { id: string }) {
    try {
      const result = await this.membersService.remove(data.id);
      this.server.emit('members:deleted', result);
      client.emit('members:delete:response', {
        success: true,
        data: result,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('members:stats')
  async handleGetMembersStats(client: Socket) {
    try {
      const result = await this.membersService.getStats();
      client.emit('members:stats:response', {
        success: true,
        data: result,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // Attendance endpoints
  @SubscribeMessage('attendance:records')
  async handleGetAttendanceRecords(client: Socket, data: { limit?: number }) {
    try {
      const result = this.attendanceService.getRecords(data?.limit || 10);
      client.emit('attendance:records:response', result);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('attendance:stats')
  async handleGetAttendanceStats(client: Socket) {
    try {
      const result = this.attendanceService.getStats();
      client.emit('attendance:stats:response', result);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // Financial endpoints
  @SubscribeMessage('financial:accounts')
  async handleGetAccounts(client: Socket) {
    try {
      const result = this.financialService.getAccounts();
      client.emit('financial:accounts:response', result);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('financial:balance')
  async handleGetBalance(client: Socket, data: { id?: string }) {
    try {
      const result = this.financialService.getBalance(data?.id);
      client.emit('financial:balance:response', result);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('financial:transactions')
  async handleGetTransactions(client: Socket, data: { limit?: number }) {
    try {
      const result = this.financialService.getTransactions(data?.limit || 10);
      client.emit('financial:transactions:response', result);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // Reports endpoints
  @SubscribeMessage('reports:summary')
  async handleGetReportsSummary(client: Socket) {
    try {
      const result = this.reportsService.getSummary();
      client.emit('reports:summary:response', result);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('reports:analytics')
  async handleGetAnalytics(client: Socket, data: { period?: string }) {
    try {
      const result = this.reportsService.getAnalytics(data?.period || 'monthly');
      client.emit('reports:analytics:response', result);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // Generic health check
  @SubscribeMessage('health:check')
  async handleHealthCheck(client: Socket) {
    client.emit('health:check:response', {
      success: true,
      message: 'Backend is healthy',
      timestamp: new Date().toISOString(),
    });
  }

  // Logs endpoints
  @SubscribeMessage('logs:recent')
  async handleGetRecentLogs(client: Socket, data: { limit?: number }) {
    try {
      const result = await this.logsService.getAllLogs(data?.limit || 100);
      client.emit('logs:recent:response', result);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('logs:all')
  async handleGetAllLogs(client: Socket) {
    try {
      const result = await this.logsService.getAllLogs(100);
      client.emit('logs:all:response', result);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('logs:stats')
  async handleGetLogStats(client: Socket) {
    try {
      const result = await this.logsService.getLogStats();
      client.emit('logs:stats:response', result);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('logs:clear')
  async handleClearLogs(client: Socket) {
    try {
      const result = await this.logsService.clearOldLogs(30);
      client.emit('logs:clear:response', result);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }
}

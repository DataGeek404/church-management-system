import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MembersModule } from './modules/members/members.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { FinancialModule } from './modules/financial/financial.module';
import { EventsModule } from './modules/events/events.module';
import { CommunicationModule } from './modules/communication/communication.module';
import { ReportsModule } from './modules/reports/reports.module';
import { LogsModule } from './modules/logs/logs.module';
import { EventsGateway } from './gateways/events.gateway';
import { ApiGateway } from './gateways/api.gateway';
import { RolesGuard } from './auth/roles.guard';
import { LoggingMiddleware } from './middleware/logging.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 3306),
        username: configService.get('DB_USER', 'church_admin'),
        password: configService.get('DB_PASSWORD', 'church_password_123'),
        database: configService.get('DB_NAME', 'church_management'),
        entities: ['dist/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: process.env.NODE_ENV === 'development' ? false : false,
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ttl: 60 * 60 * 24,
      }),
    }),
    // Feature modules
    AuthModule,
    UsersModule,
    MembersModule,
    AttendanceModule,
    FinancialModule,
    EventsModule,
    CommunicationModule,
    ReportsModule,
    LogsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    EventsGateway,
    ApiGateway,
    // DO NOT apply RolesGuard globally - it needs to run after JwtAuthGuard
    // RolesGuard should only be applied to specific routes via @UseGuards()
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}


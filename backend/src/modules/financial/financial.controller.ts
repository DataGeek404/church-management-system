import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FinancialService } from './financial.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('Financial')
@Controller('financial')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Get()
  getHello() {
    return this.financialService.getHello();
  }

  @Get('accounts')
  @ApiOperation({ summary: 'Get all financial accounts' })
  getAccounts() {
    return this.financialService.getAccounts();
  }

  @Get('accounts/:id/balance')
  @ApiOperation({ summary: 'Get account balance' })
  getBalance(@Param('id') id: string) {
    return this.financialService.getBalance(id);
  }

  @Get('accounts/:id/report')
  @ApiOperation({ summary: 'Get account report' })
  getReport(@Param('id') id: string) {
    return this.financialService.getReport(id);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get financial transactions' })
  async getTransactions(@Query('limit') limit?: string | number) {
    const parsedLimit = limit ? parseInt(String(limit), 10) : 100;
    return await this.financialService.getTransactions(parsedLimit);
  }

  @Get('transactions/:id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  async getTransactionById(@Param('id') id: string) {
    return await this.financialService.getTransactionById(id);
  }

  @Post('transactions')
  @ApiOperation({ summary: 'Create financial transaction' })
  async createTransaction(@Body() data: any) {
    return await this.financialService.createTransaction(data);
  }

  @Put('transactions/:id')
  @ApiOperation({ summary: 'Update financial transaction' })
  async updateTransaction(@Param('id') id: string, @Body() data: any) {
    return await this.financialService.updateTransaction(id, data);
  }

  @Delete('transactions/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete financial transaction' })
  async deleteTransaction(@Param('id') id: string) {
    return await this.financialService.deleteTransaction(id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get financial statistics' })
  getStats() {
    return this.financialService.getStats();
  }
}

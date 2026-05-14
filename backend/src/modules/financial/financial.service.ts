import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { FinancialTransaction } from './entities/financial-transaction.entity';

@Injectable()
export class FinancialService {
  constructor(
    @InjectRepository(FinancialTransaction)
    private transactionRepository: Repository<FinancialTransaction>,
  ) {}

  getHello() {
    return { message: 'Financial Service' };
  }

  getAccounts() {
    return {
      success: true,
      data: [],
    };
  }

  async getBalance(id?: string) {
    const query = this.transactionRepository.createQueryBuilder('transaction');

    if (id) {
      query.where('transaction.accountId = :accountId', { accountId: id });
    }

    const transactions = await query.getMany();

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(String(t.amount)), 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(String(t.amount)), 0);

    const balance = totalIncome - totalExpense;

    return {
      success: true,
      data: {
        accountId: id || null,
        balance,
        totalIncome,
        totalExpense,
        currency: 'KES',
        lastUpdated: new Date().toISOString(),
      },
    };
  }

  async getReport(id?: string) {
    const query = this.transactionRepository.createQueryBuilder('transaction');

    if (id) {
      query.where('transaction.accountId = :accountId', { accountId: id });
    }

    const transactions = await query.getMany();

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(String(t.amount)), 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(String(t.amount)), 0);

    return {
      success: true,
      data: {
        accountId: id || null,
        totalTransactions: transactions.length,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  async getTransactions(limit: number = 100) {
    const transactions = await this.transactionRepository.find({
      order: {
        recordedDate: 'DESC',
      },
      take: limit,
    });

    const total = await this.transactionRepository.count();

    return {
      success: true,
      data: transactions,
      total,
      limit,
    };
  }

  async getTransactionById(id: string) {
    const transaction = await this.transactionRepository.findOne({ where: { id } });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return {
      success: true,
      data: transaction,
    };
  }

  async createTransaction(data: any) {
    const transaction = this.transactionRepository.create({
      id: uuid(),
      accountId: data.accountId,
      type: data.type,
      amount: parseFloat(String(data.amount)) || 0,
      category: data.category,
      description: data.description || null,
      recordedDate: new Date(),
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    return {
      success: true,
      data: savedTransaction,
      message: 'Transaction recorded successfully',
    };
  }

  async updateTransaction(id: string, data: any) {
    const transaction = await this.transactionRepository.findOne({ where: { id } });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    if (data.accountId) transaction.accountId = data.accountId;
    if (data.type) transaction.type = data.type;
    if (data.amount !== undefined) transaction.amount = parseFloat(String(data.amount));
    if (data.category) transaction.category = data.category;
    if (data.description !== undefined) transaction.description = data.description;
    if (data.recordedDate) transaction.recordedDate = new Date(data.recordedDate);

    const updatedTransaction = await this.transactionRepository.save(transaction);

    return {
      success: true,
      data: updatedTransaction,
      message: 'Transaction updated successfully',
    };
  }

  async deleteTransaction(id: string) {
    const transaction = await this.transactionRepository.findOne({ where: { id } });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    await this.transactionRepository.remove(transaction);

    return {
      success: true,
      message: 'Transaction deleted successfully',
    };
  }

  async getStats() {
    const total = await this.transactionRepository.count();
    const income = await this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.type = :type', { type: 'income' })
      .getMany();

    const totalIncome = income.reduce((sum, t) => sum + parseFloat(String(t.amount)), 0);

    return {
      success: true,
      data: {
        totalTransactions: total,
        totalIncome,
        transactionCount: total,
      },
    };
  }
}


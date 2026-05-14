import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('financial_transactions')
export class FinancialTransaction {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 100 })
  accountId: string;

  @Column('varchar', { length: 50 })
  type: string;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column('varchar', { length: 100 })
  category: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('datetime')
  recordedDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


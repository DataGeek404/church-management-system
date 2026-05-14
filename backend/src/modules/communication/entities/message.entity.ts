import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('communication_messages')
export class Message {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 36 })
  recipientId: string;

  @Column('varchar', { length: 255 })
  subject: string;

  @Column('text')
  body: string;

  @Column('varchar', { length: 50 })
  type: string;

  @Column('varchar', { length: 50, default: 'Pending' })
  status: string;

  @Column('datetime')
  sentTime: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


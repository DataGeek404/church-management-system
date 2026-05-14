import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('events')
export class Event {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 255 })
  title: string;

  @Column('varchar', { length: 50 })
  type: string;

  @Column('datetime')
  date: Date;

  @Column('varchar', { length: 255, nullable: true })
  location: string;

  @Column('int', { nullable: true })
  capacity: number;

  @Column('int', { default: 0 })
  attendees: number;

  @Column('text', { nullable: true })
  description: string;

  @Column('varchar', { length: 50, default: 'Scheduled' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('attendance_records')
export class AttendanceRecord {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 36 })
  serviceId: string;

  @Column('varchar', { length: 36 })
  memberId: string;

  @Column('datetime')
  checkInTime: Date;

  @Column('datetime', { nullable: true })
  checkOutTime: Date;

  @Column('varchar', { length: 50, default: 'Present' })
  status: string;

  @Column('text', { nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


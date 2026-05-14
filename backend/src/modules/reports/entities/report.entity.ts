import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('reports')
export class Report {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 100 })
  type: string;

  @Column('datetime')
  generatedAt: Date;

  @Column('varchar', { length: 50, default: 'Completed' })
  status: string;

  @Column('varchar', { length: 50, nullable: true })
  accuracy: string;

  @Column('longtext', { nullable: true })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


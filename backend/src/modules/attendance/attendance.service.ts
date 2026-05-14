import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { AttendanceRecord } from './entities/attendance-record.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRecord)
    private attendanceRepository: Repository<AttendanceRecord>,
  ) {}

  async getRecords(limit: number = 100) {
    console.log(`📍 Getting attendance records with limit: ${limit}`);

    const records = await this.attendanceRepository.find({
      order: {
        createdAt: 'DESC',
      },
      take: limit,
    });

    const total = await this.attendanceRepository.count();

    console.log(`📍 Retrieved ${records.length} attendance records from database`);

    return {
      success: true,
      data: records,
      total,
      limit,
    };
  }

  async getRecordById(id: string) {
    console.log(`📍 Getting attendance record: ${id}`);

    const record = await this.attendanceRepository.findOne({ where: { id } });

    if (!record) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    return {
      success: true,
      data: record,
    };
  }

  async recordAttendance(data: any): Promise<any> {
    console.log('📍 Recording attendance:', data);

    const record = this.attendanceRepository.create({
      id: uuid(),
      serviceId: data.serviceId,
      memberId: data.memberId,
      checkInTime: new Date(data.checkInTime),
      checkOutTime: data.checkOutTime ? new Date(data.checkOutTime) : null,
      status: data.status || 'Present',
      notes: data.notes || null,
    });

    const savedRecord = await this.attendanceRepository.save(record);
    console.log('✅ Attendance recorded to database:', savedRecord.id);

    return {
      success: true,
      data: savedRecord,
      message: 'Attendance recorded successfully',
    };
  }

  async updateRecord(id: string, data: any) {
    console.log(`📍 Updating attendance record: ${id}`);

    const record = await this.attendanceRepository.findOne({ where: { id } });

    if (!record) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    if (data.serviceId) record.serviceId = data.serviceId;
    if (data.memberId) record.memberId = data.memberId;
    if (data.checkInTime) record.checkInTime = new Date(data.checkInTime);
    if (data.checkOutTime !== undefined) {
      record.checkOutTime = data.checkOutTime ? new Date(data.checkOutTime) : null;
    }
    if (data.status) record.status = data.status;
    if (data.notes !== undefined) record.notes = data.notes;

    const updatedRecord = await this.attendanceRepository.save(record);
    console.log(`✅ Attendance record updated: ${updatedRecord.id}`);

    return {
      success: true,
      data: updatedRecord,
      message: 'Attendance record updated successfully',
    };
  }

  async deleteRecord(id: string) {
    console.log(`📍 Deleting attendance record: ${id}`);

    const record = await this.attendanceRepository.findOne({ where: { id } });

    if (!record) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    await this.attendanceRepository.remove(record);
    console.log(`✅ Attendance record deleted: ${id}`);

    return {
      success: true,
      message: 'Attendance record deleted successfully',
    };
  }

  async getStats() {
    console.log('📍 Getting attendance statistics');

    const total = await this.attendanceRepository.count();
    const present = await this.attendanceRepository.count({
      where: { status: 'Present' },
    });
    const absent = await this.attendanceRepository.count({
      where: { status: 'Absent' },
    });

    return {
      success: true,
      data: {
        totalAttendances: total,
        presentCount: present,
        absentCount: absent,
        attendanceRate: total > 0 ? ((present / total) * 100).toFixed(2) + '%' : '0%',
      },
    };
  }

  async getOne(id: string) {
    console.log(`📍 Getting attendance record: ${id}`);

    const record = await this.attendanceRepository.findOne({ where: { id } });

    return {
      success: !!record,
      data: record || null,
      message: record ? 'Attendance record found' : 'Attendance record not found',
    };
  }

  async getByService(serviceId: string) {
    console.log(`📍 Getting attendance records for service: ${serviceId}`);

    const records = await this.attendanceRepository.find({
      where: { serviceId },
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      data: records,
      total: records.length,
    };
  }
}


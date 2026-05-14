import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Report } from './entities/report.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
  ) {}

  getHello() {
    return { message: 'Reports Service' };
  }

  async getSummary() {
    const totalReports = await this.reportRepository.count();
    const completedReports = await this.reportRepository.count({
      where: { status: 'Completed' },
    });

    return {
      success: true,
      data: {
        totalReports,
        completedReports,
        pendingReports: totalReports - completedReports,
      },
    };
  }

  async getAnalytics(period: string = 'monthly') {
    const reports = await this.reportRepository.find({
      order: { generatedAt: 'DESC' },
      take: 10,
    });

    return {
      success: true,
      data: {
        period,
        totalReports: reports.length,
        reports,
      },
    };
  }

  async getReports(type?: string) {
    const query = this.reportRepository.createQueryBuilder('report');

    if (type) {
      query.where('report.type = :type', { type });
    }

    const reports = await query
      .orderBy('report.generatedAt', 'DESC')
      .getMany();

    const total = await query.getCount();

    return {
      success: true,
      data: reports,
      total,
    };
  }

  async generateReport(data: any) {
    const report = this.reportRepository.create({
      id: uuid(),
      type: data.type || 'general',
      generatedAt: new Date(),
      status: 'Completed',
      accuracy: '95%',
      content: JSON.stringify(data),
    });

    const savedReport = await this.reportRepository.save(report);

    // Logging suppressed for security
    // if (process.env.NODE_ENV !== 'production') console.log(`📊 Report Generated: ID=${savedReport.id}, Type=${savedReport.type}`);

    return {
      success: true,
      data: savedReport,
      message: 'Report generated successfully',
    };
  }

  async getReport(id: string) {
    const report = await this.reportRepository.findOne({ where: { id } });

    return {
      success: !!report,
      data: report || null,
      message: report ? 'Report found' : 'Report not found',
    };
  }

  private convertToCSV(data: any): string {
    let csv = '';

    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        return data;
      }
    }

    if (Array.isArray(data)) {
      if (data.length === 0) return '';

      // Get headers
      const headers = Object.keys(data[0]);
      csv = headers.join(',') + '\n';

      // Get rows
      data.forEach((row) => {
        const values = headers.map((header) => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        });
        csv += values.join(',') + '\n';
      });
    } else if (typeof data === 'object') {
      const entries = Object.entries(data);
      csv = 'Field,Value\n';
      entries.forEach(([key, value]) => {
        const valueStr = String(value).replace(/"/g, '""');
        csv += `"${key}","${valueStr}"\n`;
      });
    }

    return csv;
  }

  async exportReport(id: string, format: string = 'json') {
    const report = await this.reportRepository.findOne({ where: { id } });

    if (!report) {
      return {
        success: false,
        message: 'Report not found',
      };
    }

    let exportedData: any;
    let contentType = 'application/json';
    let filename = `report-${id}`;

    try {
      const content = JSON.parse(report.content);

      switch (format.toLowerCase()) {
        case 'csv':
          exportedData = this.convertToCSV(content);
          contentType = 'text/csv';
          filename += '.csv';
          break;

        case 'pdf':
          // For PDF, we'll return the data in a structured format
          // In a real implementation, you'd use a library like pdfkit
          exportedData = {
            title: `${report.type} Report`,
            generatedAt: report.generatedAt,
            content: content,
            metadata: {
              id: report.id,
              type: report.type,
              status: report.status,
              accuracy: report.accuracy,
            },
          };
          contentType = 'application/pdf';
          filename += '.pdf';
          break;

        case 'json':
        default:
          exportedData = content;
          contentType = 'application/json';
          filename += '.json';
      }

      // Logging suppressed for security
      // if (process.env.NODE_ENV !== 'production') console.log(`📤 Report Exported: ID=${id}, Format=${format.toUpperCase()}`);

      return {
        success: true,
        data: {
          reportId: id,
          type: report.type,
          content: exportedData,
          contentType,
          filename,
          exportedAt: new Date().toISOString(),
          format: format.toUpperCase(),
          accuracy: report.accuracy,
          status: report.status,
        },
        message: `Report exported successfully as ${format.toUpperCase()}`,
      };
    } catch (error) {
      console.error(`❌ Export Error: ${error.message}`);
      return {
        success: false,
        message: 'Failed to export report',
        error: error.message,
      };
    }
  }

  async deleteReport(id: string) {
    const report = await this.reportRepository.findOne({ where: { id } });

    if (!report) {
      return {
        success: false,
        message: 'Report not found',
      };
    }

    await this.reportRepository.remove(report);

    console.log(`🗑️ Report Deleted: ID=${id}, Type=${report.type}`);

    return {
      success: true,
      message: 'Report deleted successfully',
    };
  }
}


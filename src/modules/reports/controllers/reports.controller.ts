import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from '../services/reports.service';

@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('customers')
    async getCustomerSalesReport(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.reportsService.getCustomerSalesReport(startDate, endDate);
    }

    @Get('daily')
    async getDailyReport(@Query() query: { date?: string; page?: number; pageSize?: number }) {
        return this.reportsService.getDailyReport(query);
    }

    @Get('overview')
    async getOverviewReport(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.reportsService.getOverviewReport(startDate, endDate);
    }
}

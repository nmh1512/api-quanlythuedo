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
}

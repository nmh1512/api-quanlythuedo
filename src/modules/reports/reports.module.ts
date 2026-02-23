import { Module } from '@nestjs/common';
import { ReportsController } from './controllers/reports.controller';
import { ReportsService } from './services/reports.service';
import { RentalsModule } from '../rentals/rentals.module';

@Module({
    imports: [RentalsModule],
    controllers: [ReportsController],
    providers: [ReportsService],
})

export class ReportsModule { }

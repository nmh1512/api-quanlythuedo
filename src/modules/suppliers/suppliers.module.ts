import { Module } from '@nestjs/common';
import { SuppliersService } from './services/suppliers.service';
import { SuppliersController } from './controllers/suppliers.controller';
import { SupplierRepository } from './repositories/supplier.repository';
import { DatabaseModule } from '@/database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [SuppliersController],
    providers: [SuppliersService, SupplierRepository],
    exports: [SuppliersService],
})
export class SuppliersModule { }

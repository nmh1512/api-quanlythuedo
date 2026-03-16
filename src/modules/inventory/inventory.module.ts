import { Module } from '@nestjs/common';
import { InventoryService } from './services/inventory.service';
import { InventoryController } from './controllers/inventory.controller';
import { InventoryRepository } from './repositories/inventory.repository';
import { DatabaseModule } from '@/database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [InventoryController],
    providers: [InventoryService, InventoryRepository],
    exports: [InventoryService],
})
export class InventoryModule { }

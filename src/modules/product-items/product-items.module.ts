import { Module } from '@nestjs/common';
import { ProductItemRepository } from './repositories/product-item.repository';
import { ProductItemsService } from './services/product-items.service';
import { ProductItemsController } from './controllers/product-items.controller';

@Module({
    controllers: [ProductItemsController],
    providers: [ProductItemRepository, ProductItemsService],
    exports: [ProductItemRepository, ProductItemsService],
})
export class ProductItemsModule { }

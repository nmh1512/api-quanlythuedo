import { Module } from '@nestjs/common';
import { ProductRepository } from './repositories/product.repository';
import { ProductsService } from './services/products.service';
import { ProductsController } from './controllers/products.controller';

@Module({
    controllers: [ProductsController],
    providers: [ProductRepository, ProductsService],
    exports: [ProductRepository, ProductsService],
})
export class ProductsModule { }

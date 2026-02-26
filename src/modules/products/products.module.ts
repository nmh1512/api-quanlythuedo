import { Module } from '@nestjs/common';
import { ProductRepository } from './repositories/product.repository';
import { ProductsService } from './services/products.service';
import { ProductsController } from './controllers/products.controller';
import { PropertiesService } from './services/properties.service';
import { PropertiesController } from './controllers/properties.controller';

@Module({
    controllers: [ProductsController, PropertiesController],
    providers: [ProductRepository, ProductsService, PropertiesService],
    exports: [ProductRepository, ProductsService, PropertiesService],
})
export class ProductsModule { }

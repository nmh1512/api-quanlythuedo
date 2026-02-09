import { Module } from '@nestjs/common';
import { CategoryRepository } from './repositories/category.repository';
import { CategoriesService } from './services/categories.service';
import { CategoriesController } from './controllers/categories.controller';

@Module({
    controllers: [CategoriesController],
    providers: [CategoryRepository, CategoriesService],
    exports: [CategoryRepository, CategoriesService],
})
export class CategoriesModule { }

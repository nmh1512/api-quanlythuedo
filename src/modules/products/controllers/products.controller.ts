import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { PaginationQueryDto } from '@/common/pagination/dto/pagination-query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

const storageConfig = {
    storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            callback(null, `product-${uniqueSuffix}${ext}`);
        },
    }),
};

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    async findAll(
        @Query() query: PaginationQueryDto
    ) {
        return this.productsService.findAll(query);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.findOne(id);
    }

    @Post()
    @UseInterceptors(FileInterceptor('file', storageConfig))
    async create(
        @Body() createProductDto: CreateProductDto,
        @UploadedFile() file?: Express.Multer.File
    ) {
        return this.productsService.create(createProductDto, file);
    }

    @Patch(':id')
    @UseInterceptors(FileInterceptor('file', storageConfig))
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateProductDto: UpdateProductDto,
        @UploadedFile() file?: Express.Multer.File
    ) {
        return this.productsService.update(id, updateProductDto, file);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.remove(id);
    }

    @Get(':id/history')
    async getHistory(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.getRentalHistory(id);
    }
}

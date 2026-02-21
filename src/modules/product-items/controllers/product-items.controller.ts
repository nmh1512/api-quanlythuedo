import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ProductItemsService } from '../services/product-items.service';
import { CreateProductItemDto } from '../dto/create-product-item.dto';
import { UpdateProductItemDto } from '../dto/update-product-item.dto';
import { PaginationQueryDto } from '@/common/pagination/dto/pagination-query.dto';

@Controller('product-items')
export class ProductItemsController {
    constructor(private readonly productItemsService: ProductItemsService) { }

    @Get()
    async findAll(@Query() query: PaginationQueryDto) {
        return this.productItemsService.findAll(query);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productItemsService.findOne(id);
    }

    @Get('code/:itemCode')
    async findByCode(@Param('itemCode') itemCode: string) {
        return this.productItemsService.findByCode(itemCode);
    }

    @Post()
    async create(@Body() createProductItemDto: CreateProductItemDto) {
        return this.productItemsService.create(createProductItemDto);
    }

    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateProductItemDto: UpdateProductItemDto) {
        return this.productItemsService.update(id, updateProductItemDto);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.productItemsService.remove(id);
    }
}

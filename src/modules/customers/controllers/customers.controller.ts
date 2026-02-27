import { Controller, Get, Post, Body, Query, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { CustomersService } from '../services/customers.service';
import { PaginationQueryDto } from '@/common/pagination/dto/pagination-query.dto';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';

@Controller('customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Get()
    async findAll(@Query() query: PaginationQueryDto) {
        return this.customersService.findAll(query);
    }

    @Post()
    async create(@Body() data: CreateCustomerDto) {
        return this.customersService.create(data);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.customersService.findById(id);
    }

    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateCustomerDto) {
        return this.customersService.update(id, data);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.customersService.remove(id);
    }
}

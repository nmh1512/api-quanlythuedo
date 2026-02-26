import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { CustomersService } from '../services/customers.service';
import { PaginationQueryDto } from '@/common/pagination/dto/pagination-query.dto';
import { CreateCustomerDto } from '../dto/create-customer.dto';

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
    async findOne(@Param('id') id: string) {
        return this.customersService.findById(Number(id));
    }
}

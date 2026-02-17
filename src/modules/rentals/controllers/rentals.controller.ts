import { Controller, Post, Body, Get, Param, ParseIntPipe, Query, Patch } from '@nestjs/common';
import { RentalsService } from '../services/rentals.service';
import { CreateRentalDto } from '../dto/create-rental.dto';

@Controller('rentals')
export class RentalsController {
    constructor(private readonly rentalsService: RentalsService) { }

    @Post()
    async create(@Body() dto: CreateRentalDto) {
        return this.rentalsService.createRental(dto);
    }

    @Get()
    async findAll(@Query() query: any) {
        // Basic implementation
        return this.rentalsService.findAll(query);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.rentalsService.findOne(id);
    }

    @Patch(':id/status')
    async updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body('status') status: any
    ) {
        return this.rentalsService.updateStatus(id, status);
    }
}

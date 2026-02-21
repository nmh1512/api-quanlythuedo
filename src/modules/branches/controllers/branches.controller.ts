import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { BranchesService } from '../services/branches.service';
import { CreateBranchDto } from '../dto/create-branch.dto';
import { PaginationQueryDto } from '@/common/pagination/dto/pagination-query.dto';

@Controller('branches')
export class BranchesController {
    constructor(private readonly branchesService: BranchesService) { }

    @Get()
    async findAll(@Query() query: PaginationQueryDto) {
        return this.branchesService.findAll(query);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.branchesService.findOne(id);
    }

    @Post()
    async create(@Body() dto: CreateBranchDto) {
        return this.branchesService.create(dto);
    }

    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateBranchDto>) {
        return this.branchesService.update(id, dto);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.branchesService.remove(id);
    }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { BranchesService } from '../services/branches.service';
import { CreateBranchDto } from '../dto/create-branch.dto';

@Controller('branches')
export class BranchesController {
    constructor(private readonly branchesService: BranchesService) { }

    @Get()
    async findAll() {
        return this.branchesService.findAll();
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
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
        return this.branchesService.update(id, dto);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.branchesService.remove(id);
    }
}

import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { InventoryService } from '../services/inventory.service';
import { CreateReceiveDto, CreateIssueDto, CreateDisposalDto } from '../dto/inventory.dto';
import { PaginationQueryDto } from '@/common/pagination/dto/pagination-query.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Get('receive')
    findAllReceive(@Query() query: PaginationQueryDto) {
        return this.inventoryService.findAllReceive(query);
    }

    @Post('receive')
    createReceive(@Request() req, @Body() dto: CreateReceiveDto) {
        return this.inventoryService.createReceive(req.user.id, dto);
    }

    @Get('issue')
    findAllIssue(@Query() query: PaginationQueryDto) {
        return this.inventoryService.findAllIssue(query);
    }

    @Post('issue')
    createIssue(@Request() req, @Body() dto: CreateIssueDto) {
        return this.inventoryService.createIssue(req.user.id, dto);
    }

    @Get('disposal')
    findAllDisposal(@Query() query: PaginationQueryDto) {
        return this.inventoryService.findAllDisposal(query);
    }

    @Post('disposal')
    createDisposal(@Request() req, @Body() dto: CreateDisposalDto) {
        return this.inventoryService.createDisposal(req.user.id, dto);
    }
}

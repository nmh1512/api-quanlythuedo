import { Controller, Post, Body } from '@nestjs/common';
import { POSService } from '../services/pos.service';
import { ValidateItemDto } from '../dto/validate-item.dto';

@Controller('pos')
export class POSController {
    constructor(private readonly posService: POSService) { }

    @Post('validate-item')
    async validateItem(@Body() dto: ValidateItemDto) {
        return this.posService.validateItem(
            dto.itemCode,
            new Date(dto.startDate),
            new Date(dto.endDate),
        );
    }
}

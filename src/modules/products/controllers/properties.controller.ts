import { Controller, Get } from '@nestjs/common';
import { PropertiesService } from '../services/properties.service';

@Controller('properties')
export class PropertiesController {
    constructor(private readonly propertiesService: PropertiesService) { }

    @Get()
    async findAll() {
        return this.propertiesService.findAll();
    }

    @Get('grouped')
    async findGrouped() {
        return this.propertiesService.findGrouped();
    }
}

import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { Prisma } from '@prisma/client';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    async findAll(@Query('q') query: string) {
        return this.usersService.findAll(query);
    }

    @Post()
    async create(@Body() user: Prisma.UserCreateInput) {
        // Simple create, might need validation in real app
        // Ensure email is unique is handled by Prisma but catching error is better
        return this.usersService.create(user);
    }
}

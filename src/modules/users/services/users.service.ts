import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { Prisma } from '@/generated/prisma/client';

@Injectable()
export class UsersService {
    constructor(private readonly userRepository: UserRepository) {}

    async findAll(query?: string) {
        // Basic search by name or email
        // We need to extend UserRepository or use PrismaService directly if needed, 
        // but UserRepository.prisma is private. Ideally we add a search method to UserRepository.
        // For now let's assume we can add a method there or use what's available.
        // Since I cannot easily modify UserRepository without seeing if it has search, 
        // I will add a search method to UserRepository first.
        return this.userRepository.search(query);
    }

    async create(data: Prisma.UserCreateInput) {
        return this.userRepository.create(data);
    }
    
    async findById(id: number) {
        return this.userRepository.findById(id);
    }
}

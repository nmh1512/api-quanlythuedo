import { Module } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';

@Module({
    controllers: [UsersController],
    providers: [UserRepository, UsersService],
    exports: [UserRepository, UsersService],
})
export class UsersModule { }

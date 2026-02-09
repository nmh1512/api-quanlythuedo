import { Module } from '@nestjs/common';
import { BranchRepository } from './repositories/branch.repository';
import { BranchesService } from './services/branches.service';
import { BranchesController } from './controllers/branches.controller';

@Module({
    controllers: [BranchesController],
    providers: [BranchRepository, BranchesService],
    exports: [BranchRepository, BranchesService],
})
export class BranchesModule { }

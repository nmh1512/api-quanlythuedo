import { Module } from '@nestjs/common';
import { CustomersController } from './controllers/customers.controller';
import { CustomersService } from './services/customers.service';
import { CustomerRepository } from './repositories/customer.repository';

@Module({
    controllers: [CustomersController],
    providers: [CustomersService, CustomerRepository],
    exports: [CustomersService, CustomerRepository],
})
export class CustomersModule { }

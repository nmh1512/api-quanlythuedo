import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BranchesModule } from './modules/branches/branches.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { ProductItemsModule } from './modules/product-items/product-items.module';
import { RentalsModule } from './modules/rentals/rentals.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { POSModule } from './modules/pos/pos.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ReportsModule } from './modules/reports/reports.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    BranchesModule,
    CategoriesModule,
    ProductsModule,
    ProductItemsModule,
    RentalsModule,
    PaymentsModule,
    CalendarModule,
    AvailabilityModule,
    PricingModule,
    POSModule,
    DashboardModule,
    CustomersModule,
    ReportsModule,
    UploadModule,
  ],
})
export class AppModule { }

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';
import { BrandModule } from './brand/brand.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    ProductsModule,
    CommonModule,
    BrandModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }

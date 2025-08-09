import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    ProductsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }

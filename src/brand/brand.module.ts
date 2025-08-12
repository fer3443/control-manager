import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [BrandController],
  providers: [BrandService, PrismaService],
  imports:[AuthModule]
})
export class BrandModule {}

import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, PrismaService],
  imports:[AuthModule]
})
export class CategoryModule {}

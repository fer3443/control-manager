import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Auth, GetUser } from '../auth/decorators';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('brand')
@Auth()
export class BrandController {
  constructor(private readonly brandService: BrandService) { }

  @Post()
  create(
    @Body() createBrandDto: CreateBrandDto,
    @GetUser('id') userId: string
  ) {
    return this.brandService.create(createBrandDto, userId);
  }

  @Get()
  findAll(
    @GetUser('id') userId: string,
    @Query() paginationDto:PaginationDto
  ) {
    return this.brandService.findAll(userId, paginationDto);
  }

  @Get(':term')
  findOne(
    @Param('term') term: string,
    @GetUser('id') userId: string
  ) {
    return this.brandService.findOne(term, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    return this.brandService.update(id, updateBrandDto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @GetUser('id') userId: string
  ) {
    return this.brandService.remove(id);
  }
}

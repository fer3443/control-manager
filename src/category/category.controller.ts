import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Auth, GetUser } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { PaginationDto } from '../common/dto/pagination.dto';

@Auth(ValidRoles.USER)
@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
  ) { }

  @Post()
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @GetUser('id') userId: string
  ) {
    return this.categoryService.create(createCategoryDto, userId);
  }

  @Get()
  findAll(
    @GetUser('id') userId: string,
    @Query() paginationDto:PaginationDto
  ) {
    return this.categoryService.findAll(userId, paginationDto);
  }

  @Get(':term')
  findOne(
    @Param('term') term: string,
    @GetUser('id') userId: string
  ) {
    return this.categoryService.findOne(term, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @GetUser('id') userId: string
  ) {
    return this.categoryService.update(id, updateCategoryDto, userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.remove(id);
  }
}

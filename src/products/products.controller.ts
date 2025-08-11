import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Auth, GetUser } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  @Auth(ValidRoles.USER)
  create(
    @Body() createProductDto: CreateProductDto,
    @GetUser('id') userId: string,
  ) {
    return this.productsService.create(createProductDto, userId);
  }

  @Get()
  @Auth()
  findAll(
    @GetUser('id') userId: string,
    @Query() paginationDto: PaginationDto
  ) {
    return this.productsService.findAll(userId, paginationDto);
  }

  @Get(':term')
  @Auth()
  findManyProducts(
    @GetUser('id') userId: string,
    @Param('term') term: string,
    @Query() paginationDto: PaginationDto
  ) {
    return this.productsService.findByTerm(term, userId, paginationDto);
  }

  @Patch(':id')
  @Auth()
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateProductDto: UpdateProductDto,
    @GetUser('id') userId:string
  ) {
    return this.productsService.update(id, updateProductDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}

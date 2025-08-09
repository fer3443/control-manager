import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {

  constructor(
    private readonly prisma: PrismaService
  ) { }
  async create(createProductDto: CreateProductDto, userId:string) {
    const { costPrice, profitMargin, salePrice } = createProductDto;
    let finalSalePrice = salePrice;
    //si el precio de venta no fue enviado pero el margen de ganancia si
    if (!salePrice && profitMargin !== undefined) {
      finalSalePrice = this.calculateSalePrice(costPrice, profitMargin);
    }

    //si no manda ni salePrice ni profitMargin, uso profitMarginPercentage de UserConfig
    // if(!salePrice && profitMargin === undefined){
      
    // }
    return 'This action adds a new product';
  }

  findAll() {
    return `This action returns all products`;
  }

  findOne(id: string) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }

  private calculateSalePrice(costPrice: number, profitMargin: number): number {
    return parseFloat(costPrice + (costPrice * (profitMargin / 100)).toFixed(2));
  }
}

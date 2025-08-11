import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { validate as isUUID } from 'uuid';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Product } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }
  async create(createProductDto: CreateProductDto, userId: string) {
    const { costPrice, profitMargin, salePrice } = createProductDto;
    let finalSalePrice: number = salePrice;
    //si el precio de venta no fue enviado pero el margen de ganancia si
    if (!salePrice && profitMargin !== undefined) {
      finalSalePrice = this.calculateSalePrice(costPrice, profitMargin);
    }
    const transaction = this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          ...createProductDto,
          salePrice: finalSalePrice,
          userId
        }
      });

      if (product.currentStock > 0) {
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            type: 'IN',
            quantity: product.currentStock,
            unitCost: product.costPrice,
            unitSalePrice: product.salePrice,
            reason: 'Stock inicial',
            performedById: userId
          }
        })
      }
      if (!product) throw new InternalServerErrorException('Error al crear el producto')
      return product;
    })
    return transaction
  }

  findAll(userId: string, paginationDto: PaginationDto) {
    const { limit = 20, skip = 0 } = paginationDto;
    const products = this.prisma.product.findMany({
      where: { userId },
      take: limit,
      skip,
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!products) throw new InternalServerErrorException('Error al obtener productos')
    return products;
  }

  async findByTerm(term: string, userId: string, paginationDto: PaginationDto) {
    const isId = isUUID(term);
    const { limit = 10, skip = 0 } = paginationDto
    let product: Product[];
    if (isId) {
      product = await this.prisma.product.findMany({
        where: {
          id: term,
          userId
        },
        take: limit,
        skip
      })
    } else {
      product = await this.prisma.product.findMany({
        where:
        {
          userId,
          name: { contains: term.toLocaleLowerCase(), mode: 'insensitive' }
        },
        take: limit,
        skip
      })
    }
    if (!product.length || !product) throw new NotFoundException(`No se encontró el producto con el termino: ${term}`)
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string) {
    const updatedProduct = this.prisma.$transaction(async(tx) => {
      const isExistProduct = await tx.product.findUnique({
        where: {id}
      })
      if (!isExistProduct) throw new NotFoundException(`Producto con id: "${id}" no encontrado`);
    
      const product = await tx.product.update({
        where: {id},
        data: updateProductDto
      });
      if(!product) throw new InternalServerErrorException('No se pudo actualizar el producto');

      if(typeof updateProductDto.currentStock === 'number' && isExistProduct.currentStock !== updateProductDto.currentStock){
        const stockDifference = updateProductDto.currentStock - isExistProduct.currentStock
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            type: stockDifference > 0 ? 'IN' : 'OUT',
            quantity: Math.abs(stockDifference),
            unitCost: product.costPrice,
            unitSalePrice: product.salePrice,
            reason: stockDifference > 0 ? 'Ajuste por ingreso' : 'Ajuste por salida/venta',
            performedById: userId
          }
        })
      }
      return product;
    })
    return updatedProduct;
  }

  remove(id: string) {
    return `This action removes a #${id} product`;
  }

  private calculateSalePrice(costPrice: number, profitMargin: number): number {
    const profit = costPrice * (profitMargin / 100);
    const total = costPrice + profit;
    return Number(total.toFixed(2));
  }
}
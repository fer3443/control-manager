import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
    const { costPrice, profitMargin, salePrice, name } = createProductDto;
    let finalSalePrice: number = salePrice;
    //si el precio de venta no fue enviado pero el margen de ganancia si
    if (!salePrice && profitMargin !== undefined) {
      finalSalePrice = this.calculateSalePrice(costPrice, profitMargin);
    }
    const transaction = await this.prisma.$transaction(
      async (tx) => {
        try {
          const product = await tx.product.create({
            data: {
              ...createProductDto,
              name: name.toLowerCase().trim(),
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
          return product;
        } catch (error) {
          this.handleError(error)
        }
      }
    )
    return transaction
  }

  async findAll(userId: string, paginationDto: PaginationDto) {
    const { limit = 20, skip = 0 } = paginationDto;
    const products = await this.prisma.product.findMany({
      where: { userId },
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } }
      },
      take: limit,
      skip,
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!products) throw new InternalServerErrorException('Error al obtener productos');

    return products.map(prod => ({
        ...prod,
        brand: prod.brand.name,
        category: prod.category?.name
      }))
  }

  async findByTerm(term: string, userId: string, paginationDto: PaginationDto) {
    const isId = isUUID(term);
    const { limit = 10, skip = 0 } = paginationDto
    let product: Product | Product[] | null;
    if (isId) {
      product = await this.prisma.product.findFirst({
        where: {
          id: term,
          userId
        }
      })
    } else {
      product = await this.prisma.product.findMany({
        where:
        {
          userId,
          name: { contains: term.toLowerCase().trim(), mode: 'insensitive' }
        },
        take: limit,
        skip
      })
    }
    if (!product) throw new NotFoundException(`No se encontró el producto con el termino: ${term}`)
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string) {
    const updatedProduct = this.prisma.$transaction(async (tx) => {
      const updateData = {...updateProductDto}
      if(updateData.name){
        updateData.name = updateData.name.toLowerCase().trim()
      }
      const isExistProduct = await tx.product.findUnique({
        where: { id }
      })
      if (!isExistProduct) throw new NotFoundException(`Producto con id: "${id}" no encontrado`);

      const product = await tx.product.update({
        where: { id },
        data: updateData
      });
      if (!product) throw new InternalServerErrorException('No se pudo actualizar el producto');

      if (typeof updateProductDto.currentStock === 'number' && isExistProduct.currentStock !== updateProductDto.currentStock) {
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

  private handleError(error: any) {
    if (error.code === 'P2003') {
      throw new ConflictException(`Error al crear producto: ${error.meta.constraint}`)
    }

    throw new InternalServerErrorException('Error al crear producto')
  }
}
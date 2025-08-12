import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PrismaService } from '../prisma/prisma.service';
import { validate as isUUID } from 'uuid';
import { Brand } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class BrandService {
  constructor(
    private readonly prisma: PrismaService
  ) { }
  async create(createBrandDto: CreateBrandDto, userId: string) {
    //primero corroboro que no exite
    const isExist = await this.prisma.brand.findFirst({
      where: { name: createBrandDto.name.trim().toLowerCase(), userId }
    })
    if (isExist) throw new ConflictException(`La marca con nombre: "${createBrandDto.name}" ya existe`)
    //creo la marca
    const createData = {...createBrandDto}
    createData.name = createData.name.toLowerCase().trim()
    const brand = await this.prisma.brand.create({
      data: {
        ...createData,
        userId
      }
    })
    if (!brand) throw new InternalServerErrorException('No se pudo crear la marca, intente nuevamente más tarde')
    return brand;
  }

  async findAll(userId: string, paginationDto: PaginationDto) {
    const { limit = 10, skip = 0 } = paginationDto
    const brands: Brand[] = await this.prisma.brand.findMany({
      where: { userId },
      skip,
      take: limit
    })

    if (!brands.length) throw new NotFoundException('No se encontraron marcas')
    return brands;
  }

  async findOne(term: string, userId: string) {
    const isId = isUUID(term)
    let brand: Brand | null;
    if (isId) {
      brand = await this.prisma.brand.findFirst({
        where: {
          id: term,
          userId
        }
      })
    } else {
      brand = await this.prisma.brand.findFirst({
        where: {
          name: term.trim().toLowerCase(),
          userId
        }
      })
    }
    if (!brand) throw new NotFoundException(`La marca: "${term}" no fue encontrada`)
    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    const updateData = { ...updateBrandDto }
    if (updateData.name) {
      updateData.name = updateData.name.toLowerCase().trim()
    }

    const updatedBrand = await this.prisma.brand.update({
      where: { id },
      data: updateData
    })

    if (!updatedBrand) throw new InternalServerErrorException(`Error al actualizar la marca`)
    return updatedBrand;
  }

  remove(id: string) {
    return `This action removes a #${id} brand`;
  }
}

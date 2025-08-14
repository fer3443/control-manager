import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Category, Prisma, PrismaClient } from '@prisma/client';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '../prisma/prisma.service';
import { validate as isUUID } from 'uuid';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prisma: PrismaService
  ) { }
  async create(dto: CreateCategoryDto, userId: string) {
    if (dto.parentId) {
      return this.createSubCategory(dto, userId);
    }
    return this.createParentCategory(dto, userId);
  }

  private async createParentCategory(dto: CreateCategoryDto, userId: string) {
    const normalizedName = dto.name.toLowerCase().trim();

    await this.checkDuplicateCategory(this.prisma, dto.name, null, userId);

    return await this.prisma.category.create({
      data: {
        name: normalizedName,
        parentId: null,
        userId
      }
    })
  }

  private async createSubCategory(dto: CreateCategoryDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {

      if (!dto.parentId) throw new BadRequestException('No se propociono id de categoria padre');

      const normalizedName = dto.name.toLowerCase().trim();

      const parent = await tx.category.findFirst({ where: { id: dto.parentId, userId } });
      if (!parent) throw new BadRequestException('La categoria padre no existe o no pertenece al usuario');
      //valido nombre en la categoria

      await this.checkDuplicateCategory(tx, dto.name, dto.parentId, userId);

      await this.validateCircularReference(dto.parentId, userId, tx);

      const subcategory = await tx.category.create({
        data: {
          name: normalizedName,
          parentId: dto.parentId,
          userId
        }
      });
      return {
        success: true,
        message: 'Subcategoria creada con exito',
        subcategory
      }
    })
  }

  async findAll(userId: string, paginationDto: PaginationDto) {
    const { limit = 20, skip = 0 } = paginationDto;
    const categories = await this.prisma.category.findMany({
      where: { userId },
      take: limit,
      skip
    })
    return categories;
  }

  async findOne(term: string, userId: string) {
    let category: Category | null;
    if (isUUID(term)) {
      category = await this.prisma.category.findFirst({
        where: {
          id: term,
          userId
        }
      })
    } else {
      category = await this.prisma.category.findFirst({
        where: {
          name: term.trim().toLowerCase(),
          userId
        }
      })
    }

    if (!category) throw new NotFoundException(`No se encontro la categoria con el termino: ${term}`)
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      //verifico que exista la cat y q pertenece al usuario
      const category = await tx.category.findUnique({ where: { id } });
      if (!category || category.userId !== userId) throw new NotFoundException('Categoria no encontrada');

      //verifico y preparo los valores a editar
      const newName = (dto.name ?? category.name).trim().toLowerCase();
      const newParentId = dto.parentId !== undefined ? dto.parentId : category.parentId;

      await this.checkDuplicateCategory(tx, newName, newParentId, userId, id)

      //si viene un parentId entro, si es que no viene es porque solo cambio el nombre de la cat o subCat
      if (newParentId) {
        await this.validateCircularReference(newParentId, userId, tx, id)
      }

      return tx.category.update({
        where: { id },
        data: {
          name: newName,
          parentId: newParentId
        }
      })
    })
  }

  async remove(id: string) {
    const deletedCategory = await this.prisma.category.delete({ where: { id } })
    if (!deletedCategory) throw new BadRequestException('No se pudo eliminar la categoria');
    return {
      ok: true,
      message: 'Categoria eliminada con exito'
    }
  }

  private async validateCircularReference(parentId: string, userId: string, tx: Prisma.TransactionClient, categoryId?: string): Promise<void> {
    //si no hay padre sale
    if (!parentId) return;

    const allCategories = await tx.category.findMany({
      where: { userId },
      select: { id: true, parentId: true }
    });

    if (!allCategories.some(cat => cat.id === parentId)) {
      throw new BadRequestException('La categoria padre no existe o no pertenece al usuario');
    }

    if (categoryId && (categoryId === parentId)) {
      throw new BadRequestException('No se puede asignar la categoria como descendiente de si misma');
    }

    // Mapa de padres -> hijos para navegación descendente
    const childrenMap = new Map<string, string[]>();
    for (const cat of allCategories) {
      if (!childrenMap.has(cat.parentId || 'root')) {
        childrenMap.set(cat.parentId || 'root', []);
      }
      childrenMap.get(cat.parentId || 'root')!.push(cat.id);
    }

    // BFS/DFS para ver si el nuevo padre está dentro del subárbol del categoryId
    const stack = [categoryId];
    while (stack.length > 0) {
      const current = stack.pop()!;
      if (current === parentId) {
        throw new BadRequestException('Referencia circular detectada: el nuevo padre es descendiente de la categoría.');
      }
      const children = childrenMap.get(current) || [];
      stack.push(...children);
    }
  }

  private async checkDuplicateCategory(
    prismaClient: PrismaClient | Prisma.TransactionClient,
    name: string,
    parentId: string | null,
    userId: string,
    excluedId?: string
  ): Promise<void> {
    const normalizeName = name.trim().toLowerCase();

    const duplicate = await prismaClient.category.findFirst({
      where: {
        name: normalizeName,
        parentId,
        userId,
        ...(excluedId ? { NOT: { id: excluedId } } : {})
      }
    });

    if (duplicate) {
      const level = parentId ? 'subcategoria' : 'categoria padre';
      throw new BadRequestException(`Ya existe una ${level} con el nombre ${name}`)
    }
  }
}
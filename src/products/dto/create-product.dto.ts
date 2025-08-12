import { UnitMeasure } from "@prisma/client";
import { Type } from "class-transformer";
import { IsBoolean, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";

export class CreateProductDto {

  @IsString()
  name:string;

  @IsUUID()
  @IsString()
  brandId:string;
  
  @IsOptional()
  @IsString()
  description?:string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  minStock:number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  currentStock:number;

  @IsEnum(UnitMeasure)
  unitMeasure: UnitMeasure;

  @Type(() => Number)
  @IsNumber({maxDecimalPlaces:2})
  costPrice:number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber({maxDecimalPlaces: 2})
  salePrice:number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({maxDecimalPlaces:2})
  @Min(0)
  @Max(100)
  profitMargin:number;

  @IsOptional()
  @IsDateString()
  expiresDate?: Date;

  @IsOptional()
  @IsString()
  barcode?:string;

  @IsOptional()
  @IsBoolean()
  isActive?:boolean;

  @IsOptional()
  @IsUUID()
  categoryId?:string;

  @IsOptional()
  @IsUUID()
  supplierId?:string;
}

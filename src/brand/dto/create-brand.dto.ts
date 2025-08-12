import { IsBoolean, IsOptional, IsString, MinLength } from "class-validator";

export class CreateBrandDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsBoolean()
  @IsOptional()
  isActive?:boolean;
}

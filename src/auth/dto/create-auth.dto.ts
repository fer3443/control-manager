import { IsEmail, IsString, IsUUID, Matches, MaxLength, MinLength } from "class-validator";

export class CreateAuthDto {

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name:string;

  @IsString()
  @IsEmail()
  email:string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  password:string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  businessName?:string;

}

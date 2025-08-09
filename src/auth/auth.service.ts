import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'

import { CreateAuthDto } from './dto/create-auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';


@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) { }

  async register(createAuthDto: CreateAuthDto) {

    const cleanEmail = createAuthDto.email.toLowerCase().trim();
    const isExists = await this.prisma.user.findUnique({
      where: { email: cleanEmail }
    })

    if (isExists) throw new ConflictException('El email ya está registrado');

    const hashedPassword = bcrypt.hashSync(createAuthDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        ...createAuthDto,
        email: cleanEmail,
        password: hashedPassword
      }
    })
    if (!user) throw new InternalServerErrorException('Error al registrar el usuario')
    return 'Usuario registrado con éxito';
  }

  async login(loginUserDto: LoginUserDto) {
    const cleanEmail = loginUserDto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
      select: {
        id: true,
        password: true,
        name: true,
      }
    })

    if (!user) throw new UnauthorizedException('Credenciales incorrectas');

    const { id, password, ...rest } = user;

    if (!bcrypt.compareSync(loginUserDto.password, password)) throw new UnauthorizedException('Credenciales incorrectas');

    const payload: JwtPayload = { id };

    return {
      ...rest,
      token: this.getJwtToken(payload)
    }

  }

  private getJwtToken(payload: JwtPayload): string {
    const token = this.jwtService.sign(payload);
    return token;
  }

}

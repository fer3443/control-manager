import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from '@nestjs/config';
import { PrismaService } from "src/prisma/prisma.service";
import { JwtPayload } from "../interfaces/jwt-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    configService: ConfigService
  ) {
    super({
      secretOrKey: configService.get<string>('JWT_SECRET') as string,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    });
  }

  async validate(payload: JwtPayload) {
    const { id } = payload;

    const user = await this.prisma.user.findUnique({
      where: { id }
    });
    if (!user) throw new UnauthorizedException('Token invalido');
    if (!user.isActive) throw new UnauthorizedException('Usuario inactivo, contacta con el administrador');
    return user;
  }
}
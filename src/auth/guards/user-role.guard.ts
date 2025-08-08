import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { META_ROLES } from "../decorators/role-protected.decorator";
import { UserEntity } from "../entities/user.entity";

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor( private readonly reflector: Reflector){}
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.get<string[]>(META_ROLES, context.getHandler());

    if(!validRoles) return true;
    if(validRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as UserEntity;
    if(!user) throw new BadRequestException('Usuario no autorizado');

    for (const role of user.role) {
      if(validRoles.includes(role)){
        return true
      }
    }
    
    throw new ForbiddenException(`El usuario ${user.name} no tiene permisos para acceder`)
  }
}
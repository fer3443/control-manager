import { SetMetadata } from "@nestjs/common";
import { ValidRoles } from "../interfaces";

export const META_ROLES = 'role';

export const RoleProtected = (...roles: ValidRoles[]) => SetMetadata(META_ROLES, roles);

export class UserEntity {
  id:string;
  name:string;
  email:string;
  businessName?:string;
  isVeriified:boolean;
  role:string;
  isActive:boolean;
  createdAt:Date;
  updatedAt:Date;
}

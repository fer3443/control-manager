export class Product {
  id:string;
  name:string;
  brandId:string;
  description:string;
  minStock:number;
  currentStock:number;
  unitMeasure: string;
  costPrice:number;
  salePrice:number;
  profitMargin?:number;
  expiresDate?:Date;
  barcode?:string;
  isActive:boolean;
  categoryId:string;
  createdAt:Date;
  updatedAt:Date;
  stockMovement:string[];
  supplierId?:string;
  userId:string;
}

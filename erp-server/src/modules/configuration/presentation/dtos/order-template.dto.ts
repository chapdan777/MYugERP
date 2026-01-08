import { IsString, IsOptional } from 'class-validator';

export class CreateOrderTemplateRequestDto {
  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class AddSectionRequestDto {
  @IsString()
  defaultName!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class OrderSectionTemplateResponseDto {
  id!: number;
  sectionNumber!: number;
  defaultName!: string;
  description!: string | null;
  isRequired!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

export class OrderTemplateResponseDto {
  id!: number;
  name!: string;
  code!: string;
  description!: string | null;
  isActive!: boolean;
  sections!: OrderSectionTemplateResponseDto[];
  createdAt!: Date;
  updatedAt!: Date;
}

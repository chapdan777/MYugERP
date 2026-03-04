import { IsNumber, IsEnum, IsOptional, IsString } from 'class-validator';
import { DependencyType } from '../../domain/enums/dependency-type.enum';

export class CreatePropertyDependencyRequestDto {
  @IsNumber()
  sourcePropertyId!: number;

  @IsNumber()
  targetPropertyId!: number;

  @IsEnum(DependencyType)
  dependencyType!: DependencyType;

  @IsOptional()
  @IsString()
  sourceValue?: string;

  @IsOptional()
  @IsString()
  targetValue?: string;
}

export class PropertyDependencyResponseDto {
  id!: number;
  sourcePropertyId!: number;
  targetPropertyId!: number;
  dependencyType!: DependencyType;
  sourceValue!: string | null;
  targetValue!: string | null;
  isActive!: boolean;
  createdAt!: Date;
}

export class UpdatePropertyDependencyRequestDto {
  @IsOptional()
  @IsNumber()
  sourcePropertyId?: number;

  @IsOptional()
  @IsNumber()
  targetPropertyId?: number;

  @IsOptional()
  @IsEnum(DependencyType)
  dependencyType?: DependencyType;

  @IsOptional()
  @IsString()
  sourceValue?: string | null;

  @IsOptional()
  @IsString()
  targetValue?: string | null;

  @IsOptional()
  isActive?: boolean;
}


import { IsString, IsNumber, IsOptional, IsDate, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for creating an order from template
 */
export class CreateOrderFromTemplateDto {
  @IsNumber()
  templateId!: number;

  @IsNumber()
  clientId!: number;

  @IsString()
  clientName!: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deadline?: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO for creating an empty order
 */
export class CreateOrderDto {
  @IsNumber()
  clientId!: number;

  @IsString()
  clientName!: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deadline?: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO for updating order information
 */
export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deadline?: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO for adding a section to order
 */
export class AddSectionDto {
  @IsNumber()
  @Min(1)
  sectionNumber!: number;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * DTO for property value in order item
 */
export class PropertyValueDto {
  @IsNumber()
  propertyId!: number;

  @IsString()
  propertyCode!: string;

  @IsString()
  propertyName!: string;

  @IsString()
  value!: string;
}

/**
 * DTO for adding an item to section
 */
export class AddItemDto {
  @IsNumber()
  productId!: number;

  @IsString()
  productName!: string;

  @IsNumber()
  @Min(0.01)
  quantity!: number;

  @IsNumber()
  @Min(0.01)
  unit!: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  coefficient?: number;

  @IsNumber()
  @Min(0)
  basePrice!: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyValueDto)
  properties?: PropertyValueDto[];
}

/**
 * DTO for copying an order
 */
export class CopyOrderDto {
  @IsOptional()
  @IsNumber()
  newClientId?: number;

  @IsOptional()
  @IsString()
  newClientName?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  newDeadline?: Date;
}

/**
 * Response DTO for Order
 */
export class OrderResponseDto {
  id!: number;
  orderNumber!: string;
  clientId!: number;
  clientName!: string;
  status!: string;
  paymentStatus!: string;
  deadline!: Date | null;
  lockedBy!: number | null;
  lockedAt!: Date | null;
  totalAmount!: number;
  notes!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  sections!: OrderSectionResponseDto[];
}

/**
 * Response DTO for OrderSection
 */
export class OrderSectionResponseDto {
  id!: number;
  sectionNumber!: number;
  name!: string;
  description!: string | null;
  totalAmount!: number;
  items!: OrderItemResponseDto[];
}

/**
 * Response DTO for OrderItem
 */
export class OrderItemResponseDto {
  id!: number;
  productId!: number;
  productName!: string;
  quantity!: number;
  unit!: number;
  coefficient!: number;
  basePrice!: number;
  finalPrice!: number;
  totalPrice!: number;
  notes!: string | null;
  properties!: PropertyInOrderResponseDto[];
}

/**
 * Response DTO for PropertyInOrder
 */
export class PropertyInOrderResponseDto {
  propertyId!: number;
  propertyCode!: string;
  propertyName!: string;
  value!: string;
}

/**
 * Response DTO for OrderLog
 */
export class OrderLogResponseDto {
  id!: number;
  orderId!: number;
  userId!: number;
  userName!: string;
  action!: string;
  entityType!: string | null;
  entityId!: number | null;
  fieldName!: string | null;
  oldValue!: string | null;
  newValue!: string | null;
  description!: string;
  timestamp!: Date;
}

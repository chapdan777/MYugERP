import { DomainException } from '../../../../common/exceptions/domain.exception';

/**
 * WorkOrderItem Entity
 * 
 * Represents a single item within a work order that needs to be processed.
 * Multiple items can be grouped in one work order based on department strategy.
 * 
 * Business Rules:
 * - Each item references an OrderItem from the Order aggregate
 * - Tracks quantity to be processed (can be partial if split across work orders)
 * - Stores operation details at work order creation time (snapshot)
 * - Cannot modify item after work order is in progress
 */
export class WorkOrderItem {
  private id?: number;
  private workOrderId: number;
  private orderItemId: number; // Reference to OrderItem
  private productId: number;
  private productName: string;
  private operationId: number;
  private operationName: string;
  private quantity: number;
  private unit: string;
  private estimatedHours: number; // From OperationRate × quantity
  private pieceRate: number; // From OperationRate for salary calculation
  private actualHours: number | null; // Filled when work is completed
  private calculatedMaterials: string | null; // JSON with calculated materials
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(
    id: number | undefined,
    workOrderId: number,
    orderItemId: number,
    productId: number,
    productName: string,
    operationId: number,
    operationName: string,
    quantity: number,
    unit: string,
    estimatedHours: number,
    pieceRate: number,
    actualHours: number | null,
    calculatedMaterials: string | null,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.workOrderId = workOrderId;
    this.orderItemId = orderItemId;
    this.productId = productId;
    this.productName = productName;
    this.operationId = operationId;
    this.operationName = operationName;
    this.quantity = quantity;
    this.unit = unit;
    this.estimatedHours = estimatedHours;
    this.pieceRate = pieceRate;
    this.actualHours = actualHours;
    this.calculatedMaterials = calculatedMaterials;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Factory method to create a new WorkOrderItem
   */
  static create(props: {
    workOrderId: number;
    orderItemId: number;
    productId: number;
    productName: string;
    operationId: number;
    operationName: string;
    quantity: number;
    unit: string;
    estimatedHours: number;
    pieceRate: number;
    calculatedMaterials?: Record<string, unknown> | Array<unknown> | null;
  }): WorkOrderItem {
    WorkOrderItem.validateQuantity(props.quantity);
    WorkOrderItem.validateEstimatedHours(props.estimatedHours);
    WorkOrderItem.validatePieceRate(props.pieceRate);

    const now = new Date();

    // Serialize materials if provided
    const materialsJson = props.calculatedMaterials
      ? JSON.stringify(props.calculatedMaterials)
      : null;

    return new WorkOrderItem(
      undefined,
      props.workOrderId,
      props.orderItemId,
      props.productId,
      props.productName,
      props.operationId,
      props.operationName,
      props.quantity,
      props.unit,
      props.estimatedHours,
      props.pieceRate,
      null, // actualHours starts as null
      materialsJson,
      now,
      now,
    );
  }

  /**
   * Factory method to restore WorkOrderItem from database
   */
  static restore(
    id: number,
    workOrderId: number,
    orderItemId: number,
    productId: number,
    productName: string,
    operationId: number,
    operationName: string,
    quantity: number,
    unit: string,
    estimatedHours: number,
    pieceRate: number,
    actualHours: number | null,
    calculatedMaterials: string | null,
    createdAt: Date,
    updatedAt: Date,
  ): WorkOrderItem {
    return new WorkOrderItem(
      id,
      workOrderId,
      orderItemId,
      productId,
      productName,
      operationId,
      operationName,
      quantity,
      unit,
      estimatedHours,
      pieceRate,
      actualHours,
      calculatedMaterials,
      createdAt,
      updatedAt,
    );
  }

  // Validation methods
  private static validateQuantity(quantity: number): void {
    if (quantity <= 0) {
      throw new DomainException('Quantity must be greater than zero');
    }
  }

  private static validateEstimatedHours(hours: number): void {
    if (hours < 0) {
      throw new DomainException('Estimated hours cannot be negative');
    }
  }

  private static validatePieceRate(rate: number): void {
    if (rate < 0) {
      throw new DomainException('Piece rate cannot be negative');
    }
  }

  private static validateActualHours(hours: number): void {
    if (hours < 0) {
      throw new DomainException('Actual hours cannot be negative');
    }
  }

  // Business methods

  /**
   * Record actual hours spent on this item
   */
  recordActualHours(hours: number): void {
    WorkOrderItem.validateActualHours(hours);
    this.actualHours = hours;
    this.updatedAt = new Date();
  }

  /**
   * Check if actual hours have been recorded
   */
  hasActualHours(): boolean {
    return this.actualHours !== null;
  }

  /**
   * Calculate total piece rate payment for this item
   */
  calculatePieceRatePayment(): number {
    return this.pieceRate * this.quantity;
  }

  // Getters
  getId(): number | undefined {
    return this.id;
  }

  getWorkOrderId(): number {
    return this.workOrderId;
  }

  getOrderItemId(): number {
    return this.orderItemId;
  }

  getProductId(): number {
    return this.productId;
  }

  getProductName(): string {
    return this.productName;
  }

  getOperationId(): number {
    return this.operationId;
  }

  getOperationName(): string {
    return this.operationName;
  }

  getQuantity(): number {
    return this.quantity;
  }

  getUnit(): string {
    return this.unit;
  }

  getEstimatedHours(): number {
    return this.estimatedHours;
  }

  getPieceRate(): number {
    return this.pieceRate;
  }

  getActualHours(): number | null {
    return this.actualHours;
  }

  getCalculatedMaterials(): Record<string, unknown> | Array<unknown> | null {
    if (!this.calculatedMaterials) return null;
    try {
      return JSON.parse(this.calculatedMaterials);
    } catch {
      return null;
    }
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}

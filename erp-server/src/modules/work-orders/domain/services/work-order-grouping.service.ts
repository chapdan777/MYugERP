import { Injectable } from '@nestjs/common';
import { GroupingStrategy } from '../../../production/domain/entities/production-department.entity';
import {
  OrderItemForGeneration,
  OperationStepForGeneration,
} from './work-order-generation.service';

/**
 * Grouping context for work order creation
 */
export interface GroupingContext {
  departmentId: number;
  departmentName: string;
  groupingStrategy: GroupingStrategy;
  groupingPropertyId: number | null;
  operationId: number;
  operationName: string;
}

/**
 * Group of items that should be in the same work order
 */
export interface ItemGroup {
  groupKey: string;
  items: OrderItemForGeneration[];
  operation: OperationStepForGeneration;
}

/**
 * WorkOrderGroupingService - Domain Service
 * 
 * Responsible for grouping order items into work orders based on
 * department grouping strategies:
 * - BY_ORDER: Group all items from same order together
 * - BY_PRODUCT: Group same products together
 * - BY_PROPERTY: Group by specific property value
 * - NO_GROUPING: Each item becomes separate work order
 * 
 * This service implements the grouping logic that determines how many
 * work orders are created and which items go into each one.
 */
@Injectable()
export class WorkOrderGroupingService {
  /**
   * Group items according to department strategy
   */
  groupItems(
    items: OrderItemForGeneration[],
    operation: OperationStepForGeneration,
    context: GroupingContext,
  ): ItemGroup[] {
    switch (context.groupingStrategy) {
      case GroupingStrategy.BY_ORDER:
        return this.groupByOrder(items, operation);

      case GroupingStrategy.BY_PRODUCT:
        return this.groupByProduct(items, operation);

      case GroupingStrategy.BY_PROPERTY:
        return this.groupByProperty(items, operation, context.groupingPropertyId);

      case GroupingStrategy.NO_GROUPING:
        return this.noGrouping(items, operation);

      default:
        // Default to no grouping if strategy unknown
        return this.noGrouping(items, operation);
    }
  }

  /**
   * Group all items from same order together
   * Results in one work order per operation per order
   */
  private groupByOrder(
    items: OrderItemForGeneration[],
    operation: OperationStepForGeneration,
  ): ItemGroup[] {
    // All items already belong to same order, so create one group
    return [
      {
        groupKey: 'order',
        items,
        operation,
      },
    ];
  }

  /**
   * Group items by product
   * Results in one work order per product per operation
   */
  private groupByProduct(
    items: OrderItemForGeneration[],
    operation: OperationStepForGeneration,
  ): ItemGroup[] {
    const groups = new Map<number, OrderItemForGeneration[]>();

    for (const item of items) {
      const productId = item.productId;
      if (!groups.has(productId)) {
        groups.set(productId, []);
      }
      groups.get(productId)!.push(item);
    }

    return Array.from(groups.entries()).map(([productId, groupItems]) => ({
      groupKey: `product_${productId}`,
      items: groupItems,
      operation,
    }));
  }

  /**
   * Group items by specific property value
   * Results in one work order per property value per operation
   * 
   * Example: If grouping by Material property, all items with "Wood" 
   * go in one work order, all "Metal" items in another
   */
  private groupByProperty(
    items: OrderItemForGeneration[],
    operation: OperationStepForGeneration,
    propertyId: number | null,
  ): ItemGroup[] {
    if (!propertyId) {
      // If no property specified, fall back to no grouping
      return this.noGrouping(items, operation);
    }

    const groups = new Map<number, OrderItemForGeneration[]>();

    for (const item of items) {
      // Get the property value for this item
      const propertyValueId = item.propertyValues.get(propertyId);
      
      if (propertyValueId === undefined) {
        // Item doesn't have this property, create separate group
        groups.set(item.id, [item]);
      } else {
        if (!groups.has(propertyValueId)) {
          groups.set(propertyValueId, []);
        }
        groups.get(propertyValueId)!.push(item);
      }
    }

    return Array.from(groups.entries()).map(([valueId, groupItems]) => ({
      groupKey: `property_${propertyId}_value_${valueId}`,
      items: groupItems,
      operation,
    }));
  }

  /**
   * No grouping - each item gets its own work order
   * Results in maximum number of work orders
   */
  private noGrouping(
    items: OrderItemForGeneration[],
    operation: OperationStepForGeneration,
  ): ItemGroup[] {
    return items.map(item => ({
      groupKey: `item_${item.id}`,
      items: [item],
      operation,
    }));
  }

  /**
   * Calculate total quantity for a group
   */
  calculateGroupQuantity(group: ItemGroup): number {
    return group.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Get description for a group
   */
  getGroupDescription(group: ItemGroup, context: GroupingContext): string {
    const itemCount = group.items.length;
    const totalQty = this.calculateGroupQuantity(group);

    switch (context.groupingStrategy) {
      case GroupingStrategy.BY_ORDER:
        return `${itemCount} items (${totalQty} units total)`;

      case GroupingStrategy.BY_PRODUCT:
        const productName = group.items[0]?.productName || 'Unknown';
        return `${productName}: ${itemCount} items (${totalQty} units)`;

      case GroupingStrategy.BY_PROPERTY:
        return `Property group: ${itemCount} items (${totalQty} units)`;

      case GroupingStrategy.NO_GROUPING:
        const item = group.items[0];
        return `${item.productName}: ${item.quantity} ${item.unit}`;

      default:
        return `${itemCount} items`;
    }
  }

  /**
   * Validate that grouping is possible
   */
  validateGrouping(
    items: OrderItemForGeneration[],
    context: GroupingContext,
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!items || items.length === 0) {
      errors.push('No items to group');
    }

    if (context.groupingStrategy === GroupingStrategy.BY_PROPERTY) {
      if (!context.groupingPropertyId) {
        errors.push('Property grouping requires groupingPropertyId');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Merge multiple groups if they can be combined
   * Used for optimization when work orders can be consolidated
   */
  mergeCompatibleGroups(groups: ItemGroup[]): ItemGroup[] {
    // For now, don't merge groups
    // This can be extended with logic to merge groups that:
    // - Have same operation
    // - Have compatible properties
    // - Don't exceed max work order size
    return groups;
  }

  /**
   * Split large groups if they exceed maximum size
   */
  splitOversizedGroups(
    groups: ItemGroup[],
    maxItemsPerWorkOrder: number = 100,
  ): ItemGroup[] {
    const result: ItemGroup[] = [];

    for (const group of groups) {
      if (group.items.length <= maxItemsPerWorkOrder) {
        result.push(group);
      } else {
        // Split into multiple groups
        const chunks = this.chunkArray(group.items, maxItemsPerWorkOrder);
        chunks.forEach((chunk, index) => {
          result.push({
            groupKey: `${group.groupKey}_part${index + 1}`,
            items: chunk,
            operation: group.operation,
          });
        });
      }
    }

    return result;
  }

  /**
   * Utility: Split array into chunks
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Get grouping statistics for reporting
   */
  getGroupingStats(groups: ItemGroup[]): {
    totalGroups: number;
    totalItems: number;
    averageItemsPerGroup: number;
    minItemsPerGroup: number;
    maxItemsPerGroup: number;
  } {
    const totalGroups = groups.length;
    const totalItems = groups.reduce((sum, g) => sum + g.items.length, 0);
    const itemCounts = groups.map(g => g.items.length);

    return {
      totalGroups,
      totalItems,
      averageItemsPerGroup: totalItems / totalGroups || 0,
      minItemsPerGroup: Math.min(...itemCounts, 0),
      maxItemsPerGroup: Math.max(...itemCounts, 0),
    };
  }
}

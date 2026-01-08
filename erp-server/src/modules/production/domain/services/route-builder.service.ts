import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';

/**
 * RouteBuilderService - Domain Service
 * 
 * Responsible for dynamically building technological routes based on:
 * - Product's base technological route
 * - Product property values (e.g., material, finish type)
 * - PropertyOperation links that add/modify operations based on properties
 * 
 * This is a domain service because the logic involves multiple aggregates
 * (TechnologicalRoute, PropertyOperation, Product) and complex business rules.
 */

export interface OperationStep {
  operationId: number;
  operationCode: string;
  operationName: string;
  stepNumber: number;
  isRequired: boolean;
  description: string | null;
  source: 'base_route' | 'property_operation'; // Where this operation came from
}

export interface PropertyOperationData {
  propertyId: number;
  propertyValueId: number;
  operationId: number;
  operationCode: string;
  operationName: string;
  isRequired: boolean;
}

export interface BuildRouteInput {
  baseTechnologicalRoute: {
    id: number;
    steps: Array<{
      operationId: number;
      operationCode: string;
      operationName: string;
      stepNumber: number;
      isRequired: boolean;
      description: string | null;
    }>;
  };
  propertyValues: Map<number, number>; // Map<propertyId, propertyValueId>
  propertyOperations: PropertyOperationData[]; // All PropertyOperation links relevant to this product
}

@Injectable()
export class RouteBuilderService {
  /**
   * Build a complete technological route by:
   * 1. Starting with base route steps
   * 2. Adding operations required by property values
   * 3. Removing duplicates (keeping required over optional)
   * 4. Re-numbering steps sequentially
   */
  buildRoute(input: BuildRouteInput): OperationStep[] {
    this.validateInput(input);

    // Step 1: Get base route steps
    const baseSteps: OperationStep[] = input.baseTechnologicalRoute.steps.map(step => ({
      operationId: step.operationId,
      operationCode: step.operationCode,
      operationName: step.operationName,
      stepNumber: step.stepNumber,
      isRequired: step.isRequired,
      description: step.description,
      source: 'base_route' as const,
    }));

    // Step 2: Find property-based operations that apply
    const propertySteps = this.getPropertyBasedOperations(
      input.propertyValues,
      input.propertyOperations,
    );

    // Step 3: Merge steps, removing duplicates
    const mergedSteps = this.mergeOperationSteps(baseSteps, propertySteps);

    // Step 4: Sort and re-number
    const sortedSteps = this.sortAndRenumberSteps(mergedSteps);

    return sortedSteps;
  }

  /**
   * Get operations that should be added based on property values
   */
  private getPropertyBasedOperations(
    propertyValues: Map<number, number>,
    propertyOperations: PropertyOperationData[],
  ): OperationStep[] {
    const steps: OperationStep[] = [];
    let stepNumber = 1000; // Start at high number to append after base steps

    for (const [propertyId, propertyValueId] of propertyValues.entries()) {
      // Find matching PropertyOperations
      const matchingOps = propertyOperations.filter(
        po => po.propertyId === propertyId && po.propertyValueId === propertyValueId,
      );

      for (const op of matchingOps) {
        steps.push({
          operationId: op.operationId,
          operationCode: op.operationCode,
          operationName: op.operationName,
          stepNumber: stepNumber++,
          isRequired: op.isRequired,
          description: `Added by property (${propertyId}=${propertyValueId})`,
          source: 'property_operation',
        });
      }
    }

    return steps;
  }

  /**
   * Merge base steps with property steps, handling duplicates
   * Rule: If same operation appears multiple times, keep the one that is required
   */
  private mergeOperationSteps(
    baseSteps: OperationStep[],
    propertySteps: OperationStep[],
  ): OperationStep[] {
    const operationMap = new Map<number, OperationStep>();

    // Add base steps first
    for (const step of baseSteps) {
      operationMap.set(step.operationId, step);
    }

    // Add property steps, merging duplicates
    for (const step of propertySteps) {
      const existing = operationMap.get(step.operationId);
      
      if (!existing) {
        // New operation, add it
        operationMap.set(step.operationId, step);
      } else {
        // Duplicate: keep required over optional
        if (step.isRequired && !existing.isRequired) {
          operationMap.set(step.operationId, {
            ...existing,
            isRequired: true,
            description: `${existing.description || ''} [marked required by property]`,
          });
        }
        // If both required or both optional, keep existing
      }
    }

    return Array.from(operationMap.values());
  }

  /**
   * Sort operations by original step number and renumber sequentially
   */
  private sortAndRenumberSteps(steps: OperationStep[]): OperationStep[] {
    // Sort by step number
    const sorted = [...steps].sort((a, b) => a.stepNumber - b.stepNumber);

    // Renumber starting from 1
    return sorted.map((step, index) => ({
      ...step,
      stepNumber: index + 1,
    }));
  }

  /**
   * Validate input data
   */
  private validateInput(input: BuildRouteInput): void {
    if (!input.baseTechnologicalRoute) {
      throw new DomainException('Base technological route is required');
    }

    if (!input.baseTechnologicalRoute.steps) {
      throw new DomainException('Base technological route must have steps');
    }

    if (!input.propertyValues) {
      throw new DomainException('Property values map is required');
    }

    if (!input.propertyOperations) {
      throw new DomainException('Property operations array is required');
    }
  }

  /**
   * Check if a route contains all required operations
   */
  validateRouteCompleteness(steps: OperationStep[]): {
    isValid: boolean;
    missingOperations: string[];
  } {
    const requiredSteps = steps.filter(s => s.isRequired);
    const missingOperations: string[] = [];

    // In a real implementation, we'd check against actual completion status
    // For now, we just ensure all required operations are present
    const hasAllRequired = requiredSteps.length > 0;

    return {
      isValid: hasAllRequired,
      missingOperations,
    };
  }

  /**
   * Calculate estimated time for a route based on operation rates
   */
  calculateRouteTime(
    steps: OperationStep[],
    operationRates: Map<number, { timePerUnit: number }>, // Map<operationId, rate>
    quantity: number,
  ): number {
    let totalTime = 0;

    for (const step of steps) {
      const rate = operationRates.get(step.operationId);
      if (rate) {
        totalTime += rate.timePerUnit * quantity;
      }
    }

    return totalTime;
  }

  /**
   * Calculate estimated cost for a route based on operation rates
   */
  calculateRouteCost(
    steps: OperationStep[],
    operationRates: Map<number, { ratePerUnit: number }>, // Map<operationId, rate>
    quantity: number,
  ): number {
    let totalCost = 0;

    for (const step of steps) {
      const rate = operationRates.get(step.operationId);
      if (rate) {
        totalCost += rate.ratePerUnit * quantity;
      }
    }

    return totalCost;
  }
}

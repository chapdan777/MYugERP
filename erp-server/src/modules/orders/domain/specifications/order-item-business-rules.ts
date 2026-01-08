import { OrderSection } from '../entities/order-section.entity';
import { OrderItem } from '../entities/order-item.entity';
import { DomainException } from '../../../../common/exceptions/domain.exception';

/**
 * Business Rules for OrderItem and OrderSection
 */

/**
 * Rule: Item quantity must be positive
 */
export class ItemQuantityMustBePositiveRule {
  static isSatisfiedBy(quantity: number): boolean {
    return quantity > 0;
  }

  static assertSatisfied(quantity: number): void {
    if (!this.isSatisfiedBy(quantity)) {
      throw new DomainException('Item quantity must be greater than zero');
    }
  }
}

/**
 * Rule: Item unit must be positive
 */
export class ItemUnitMustBePositiveRule {
  static isSatisfiedBy(unit: number): boolean {
    return unit > 0;
  }

  static assertSatisfied(unit: number): void {
    if (!this.isSatisfiedBy(unit)) {
      throw new DomainException('Item unit must be greater than zero');
    }
  }
}

/**
 * Rule: Item coefficient must be positive
 */
export class ItemCoefficientMustBePositiveRule {
  static isSatisfiedBy(coefficient: number): boolean {
    return coefficient > 0;
  }

  static assertSatisfied(coefficient: number): void {
    if (!this.isSatisfiedBy(coefficient)) {
      throw new DomainException('Item coefficient must be greater than zero');
    }
  }
}

/**
 * Rule: Item base price must not be negative
 */
export class ItemBasePriceValidRule {
  static isSatisfiedBy(basePrice: number): boolean {
    return basePrice >= 0;
  }

  static assertSatisfied(basePrice: number): void {
    if (!this.isSatisfiedBy(basePrice)) {
      throw new DomainException('Item base price cannot be negative');
    }
  }
}

/**
 * Rule: Maximum number of items per section
 */
export class MaxItemsPerSectionRule {
  private static readonly MAX_ITEMS = 100;

  static isSatisfiedBy(section: OrderSection): boolean {
    return section.getItems().length < this.MAX_ITEMS;
  }

  static assertSatisfied(section: OrderSection): void {
    if (!this.isSatisfiedBy(section)) {
      throw new DomainException(
        `Section cannot have more than ${this.MAX_ITEMS} items`,
      );
    }
  }
}

/**
 * Rule: Section must have a valid name
 */
export class SectionNameValidRule {
  static isSatisfiedBy(name: string): boolean {
    return !!name && name.trim().length > 0 && name.trim().length <= 200;
  }

  static assertSatisfied(name: string): void {
    if (!this.isSatisfiedBy(name)) {
      throw new DomainException(
        'Section name must be between 1 and 200 characters',
      );
    }
  }
}

/**
 * Rule: Item product name must be valid
 */
export class ItemProductNameValidRule {
  static isSatisfiedBy(productName: string): boolean {
    return (
      !!productName &&
      productName.trim().length > 0 &&
      productName.trim().length <= 255
    );
  }

  static assertSatisfied(productName: string): void {
    if (!this.isSatisfiedBy(productName)) {
      throw new DomainException(
        'Product name must be between 1 and 255 characters',
      );
    }
  }
}

/**
 * Rule: Section number must be positive
 */
export class SectionNumberMustBePositiveRule {
  static isSatisfiedBy(sectionNumber: number): boolean {
    return sectionNumber > 0;
  }

  static assertSatisfied(sectionNumber: number): void {
    if (!this.isSatisfiedBy(sectionNumber)) {
      throw new DomainException('Section number must be greater than zero');
    }
  }
}

/**
 * Rule: Item final price should not be less than base price (unless discounts applied)
 * This is a warning rule, not a blocking one
 */
export class ItemPriceConsistencyRule {
  static isSatisfiedBy(basePrice: number, finalPrice: number): boolean {
    // Allow up to 90% discount (finalPrice can be as low as 10% of basePrice)
    return finalPrice >= basePrice * 0.1;
  }

  static assertSatisfied(basePrice: number, finalPrice: number): void {
    if (!this.isSatisfiedBy(basePrice, finalPrice)) {
      throw new DomainException(
        'Final price appears to be too low compared to base price',
      );
    }
  }
}

/**
 * Rule: Item total price must equal finalPrice × quantity
 */
export class ItemTotalPriceConsistencyRule {
  private static readonly EPSILON = 0.01; // Allow small floating point differences

  static isSatisfiedBy(
    finalPrice: number,
    quantity: number,
    totalPrice: number,
  ): boolean {
    const expectedTotal = finalPrice * quantity;
    return Math.abs(totalPrice - expectedTotal) < this.EPSILON;
  }

  static assertSatisfied(
    finalPrice: number,
    quantity: number,
    totalPrice: number,
  ): void {
    if (!this.isSatisfiedBy(finalPrice, quantity, totalPrice)) {
      throw new DomainException(
        'Item total price is inconsistent with final price and quantity',
      );
    }
  }
}

/**
 * Rule: Maximum number of properties per item
 */
export class MaxPropertiesPerItemRule {
  private static readonly MAX_PROPERTIES = 50;

  static isSatisfiedBy(item: OrderItem): boolean {
    return item.getProperties().length < this.MAX_PROPERTIES;
  }

  static assertSatisfied(item: OrderItem): void {
    if (!this.isSatisfiedBy(item)) {
      throw new DomainException(
        `Item cannot have more than ${this.MAX_PROPERTIES} properties`,
      );
    }
  }
}

/**
 * Composite rule to validate item before adding to section
 */
export class ItemValidationRule {
  static validate(props: {
    quantity: number;
    unit: number;
    coefficient: number;
    basePrice: number;
    productName: string;
  }): void {
    ItemQuantityMustBePositiveRule.assertSatisfied(props.quantity);
    ItemUnitMustBePositiveRule.assertSatisfied(props.unit);
    ItemCoefficientMustBePositiveRule.assertSatisfied(props.coefficient);
    ItemBasePriceValidRule.assertSatisfied(props.basePrice);
    ItemProductNameValidRule.assertSatisfied(props.productName);
  }
}

/**
 * Composite rule to validate section before adding to order
 */
export class SectionValidationRule {
  static validate(props: { name: string; sectionNumber: number }): void {
    SectionNameValidRule.assertSatisfied(props.name);
    SectionNumberMustBePositiveRule.assertSatisfied(props.sectionNumber);
  }
}

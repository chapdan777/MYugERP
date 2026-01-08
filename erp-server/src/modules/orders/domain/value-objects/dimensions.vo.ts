import { DomainException } from '../../../../common/exceptions/domain.exception';

/**
 * Dimensions value object
 * Represents physical dimensions (length, width, height) with validation
 * Used for products that have dimensional properties
 */
export class Dimensions {
  private readonly length: number;
  private readonly width: number;
  private readonly height: number;
  private readonly unit: string;

  private constructor(
    length: number,
    width: number,
    height: number,
    unit: string = 'mm',
  ) {
    if (length <= 0) {
      throw new DomainException('Length must be greater than zero');
    }
    if (width <= 0) {
      throw new DomainException('Width must be greater than zero');
    }
    if (height <= 0) {
      throw new DomainException('Height must be greater than zero');
    }
    if (!Number.isFinite(length)) {
      throw new DomainException('Length must be a finite number');
    }
    if (!Number.isFinite(width)) {
      throw new DomainException('Width must be a finite number');
    }
    if (!Number.isFinite(height)) {
      throw new DomainException('Height must be a finite number');
    }
    if (!unit || unit.trim().length === 0) {
      throw new DomainException('Unit is required');
    }

    // Validate unit (mm, cm, m, inch, ft)
    const validUnits = ['mm', 'cm', 'm', 'inch', 'ft'];
    if (!validUnits.includes(unit.toLowerCase())) {
      throw new DomainException(
        `Invalid unit: ${unit}. Must be one of: ${validUnits.join(', ')}`,
      );
    }

    this.length = length;
    this.width = width;
    this.height = height;
    this.unit = unit.toLowerCase();
  }

  static create(
    length: number,
    width: number,
    height: number,
    unit: string = 'mm',
  ): Dimensions {
    return new Dimensions(length, width, height, unit);
  }

  /**
   * Create dimensions from a cubic measurement (all sides equal)
   */
  static createCubic(side: number, unit: string = 'mm'): Dimensions {
    return new Dimensions(side, side, side, unit);
  }

  /**
   * Calculate volume
   */
  getVolume(): number {
    return this.length * this.width * this.height;
  }

  /**
   * Calculate surface area (sum of all 6 faces)
   */
  getSurfaceArea(): number {
    return (
      2 * (this.length * this.width) +
      2 * (this.length * this.height) +
      2 * (this.width * this.height)
    );
  }

  /**
   * Get the area of the base (length × width)
   */
  getBaseArea(): number {
    return this.length * this.width;
  }

  /**
   * Check if dimensions fit within another dimensions (for nesting/packaging)
   */
  fitsWithin(container: Dimensions): boolean {
    // Convert to same unit first if needed
    if (this.unit !== container.unit) {
      throw new DomainException('Cannot compare dimensions with different units');
    }

    // Check all possible orientations
    const thisDims = [this.length, this.width, this.height].sort((a, b) => a - b);
    const containerDims = [container.length, container.width, container.height].sort(
      (a, b) => a - b,
    );

    return (
      thisDims[0] <= containerDims[0] &&
      thisDims[1] <= containerDims[1] &&
      thisDims[2] <= containerDims[2]
    );
  }

  /**
   * Scale dimensions by a factor
   */
  scale(factor: number): Dimensions {
    if (factor <= 0) {
      throw new DomainException('Scale factor must be greater than zero');
    }
    if (!Number.isFinite(factor)) {
      throw new DomainException('Scale factor must be a finite number');
    }

    return new Dimensions(
      this.length * factor,
      this.width * factor,
      this.height * factor,
      this.unit,
    );
  }

  /**
   * Convert to different unit
   */
  convertTo(targetUnit: string): Dimensions {
    const conversionFactors: Record<string, Record<string, number>> = {
      mm: { mm: 1, cm: 0.1, m: 0.001, inch: 0.0393701, ft: 0.00328084 },
      cm: { mm: 10, cm: 1, m: 0.01, inch: 0.393701, ft: 0.0328084 },
      m: { mm: 1000, cm: 100, m: 1, inch: 39.3701, ft: 3.28084 },
      inch: { mm: 25.4, cm: 2.54, m: 0.0254, inch: 1, ft: 0.0833333 },
      ft: { mm: 304.8, cm: 30.48, m: 0.3048, inch: 12, ft: 1 },
    };

    const factor = conversionFactors[this.unit]?.[targetUnit.toLowerCase()];
    if (!factor) {
      throw new DomainException(
        `Cannot convert from ${this.unit} to ${targetUnit}`,
      );
    }

    return new Dimensions(
      this.length * factor,
      this.width * factor,
      this.height * factor,
      targetUnit,
    );
  }

  /**
   * Check if dimensions are equal to another
   */
  equals(other: Dimensions): boolean {
    if (this.unit !== other.unit) {
      return false;
    }
    return (
      this.length === other.length &&
      this.width === other.width &&
      this.height === other.height
    );
  }

  /**
   * Get length
   */
  getLength(): number {
    return this.length;
  }

  /**
   * Get width
   */
  getWidth(): number {
    return this.width;
  }

  /**
   * Get height
   */
  getHeight(): number {
    return this.height;
  }

  /**
   * Get unit
   */
  getUnit(): string {
    return this.unit;
  }

  /**
   * Format for display
   */
  format(): string {
    return `${this.length} × ${this.width} × ${this.height} ${this.unit}`;
  }

  /**
   * Format volume for display
   */
  formatVolume(): string {
    const volume = this.getVolume();
    return `${volume.toFixed(2)} ${this.unit}³`;
  }

  /**
   * Convert to plain object for persistence
   */
  toJSON(): { length: number; width: number; height: number; unit: string } {
    return {
      length: this.length,
      width: this.width,
      height: this.height,
      unit: this.unit,
    };
  }
}

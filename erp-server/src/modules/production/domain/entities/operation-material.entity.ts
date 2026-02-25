import { DomainException } from '../../../../common/exceptions/domain.exception';

/**
 * OperationMaterial - Связь операции и материала
 * Определяет расход материала на операцию
 */
export class OperationMaterial {
    private id?: number;
    private operationId: number;
    private materialId: number;
    private consumptionFormula: string;
    private unit: string;

    private constructor(props: {
        id?: number;
        operationId: number;
        materialId: number;
        consumptionFormula: string;
        unit: string;
    }) {
        this.id = props.id;
        this.operationId = props.operationId;
        this.materialId = props.materialId;
        this.consumptionFormula = props.consumptionFormula;
        this.unit = props.unit;

        this.validate();
    }

    static create(props: {
        operationId: number;
        materialId: number;
        consumptionFormula: string;
        unit: string;
    }): OperationMaterial {
        return new OperationMaterial(props);
    }

    static restore(props: {
        id: number;
        operationId: number;
        materialId: number;
        consumptionFormula: string;
        unit: string;
    }): OperationMaterial {
        return new OperationMaterial(props);
    }

    private validate(): void {
        if (!this.consumptionFormula) {
            throw new DomainException('Формула расхода обязательна');
        }
        if (!this.unit) {
            throw new DomainException('Единица измерения обязательна');
        }
    }

    // Геттеры
    getId(): number | undefined {
        return this.id;
    }

    getOperationId(): number {
        return this.operationId;
    }

    getMaterialId(): number {
        return this.materialId;
    }

    getConsumptionFormula(): string {
        return this.consumptionFormula;
    }

    getUnit(): string {
        return this.unit;
    }
}

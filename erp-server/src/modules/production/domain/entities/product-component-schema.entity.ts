/**
 * Схема компонента продукта (BOM - Bill of Materials)
 * @description Описывает деталь, из которой состоит продукт, и формулы для расчёта её параметров.
 * Поддерживает рекурсивную вложенность через ссылку на дочернюю номенклатуру.
 */
export class ProductComponentSchema {
    constructor(
        private id: number,
        private productId: number,
        private name: string,
        private lengthFormula: string,
        private widthFormula: string,
        private quantityFormula: string,
        private childProductId: number | null,
        private depthFormula: string | null,
        private extraVariables: Record<string, string> | null,
        private conditionFormula: string | null,
        private sortOrder: number,
    ) { }

    /**
     * Создаёт новый экземпляр схемы компонента
     */
    static create(props: {
        productId: number;
        name: string;
        lengthFormula: string;
        widthFormula: string;
        quantityFormula: string;
        childProductId?: number | null;
        depthFormula?: string | null;
        extraVariables?: Record<string, string> | null;
        conditionFormula?: string | null;
        sortOrder?: number;
    }): ProductComponentSchema {
        return new ProductComponentSchema(
            0,
            props.productId,
            props.name,
            props.lengthFormula,
            props.widthFormula,
            props.quantityFormula,
            props.childProductId ?? null,
            props.depthFormula ?? null,
            props.extraVariables ?? null,
            props.conditionFormula ?? null,
            props.sortOrder ?? 0,
        );
    }

    /**
     * Восстанавливает сущность из персистентного состояния
     */
    static restore(props: {
        id: number;
        productId: number;
        name: string;
        lengthFormula: string;
        widthFormula: string;
        quantityFormula: string;
        childProductId: number | null;
        depthFormula: string | null;
        extraVariables: Record<string, string> | null;
        conditionFormula: string | null;
        sortOrder: number;
    }): ProductComponentSchema {
        return new ProductComponentSchema(
            props.id,
            props.productId,
            props.name,
            props.lengthFormula,
            props.widthFormula,
            props.quantityFormula,
            props.childProductId,
            props.depthFormula,
            props.extraVariables,
            props.conditionFormula,
            props.sortOrder,
        );
    }

    // Геттеры
    getId(): number { return this.id; }
    getProductId(): number { return this.productId; }
    getName(): string { return this.name; }
    getLengthFormula(): string { return this.lengthFormula; }
    getWidthFormula(): string { return this.widthFormula; }
    getQuantityFormula(): string { return this.quantityFormula; }
    getChildProductId(): number | null { return this.childProductId; }
    getDepthFormula(): string | null { return this.depthFormula; }
    getExtraVariables(): Record<string, string> | null { return this.extraVariables; }
    getConditionFormula(): string | null { return this.conditionFormula; }
    getSortOrder(): number { return this.sortOrder; }

    /**
     * Проверяет, ссылается ли компонент на дочернюю номенклатуру
     */
    hasChildProduct(): boolean {
        return this.childProductId !== null;
    }

    /**
     * Обновление полей схемы компонента
     */
    update(props: Partial<{
        name: string;
        lengthFormula: string;
        widthFormula: string;
        quantityFormula: string;
        childProductId: number | null;
        depthFormula: string | null;
        extraVariables: Record<string, string> | null;
        conditionFormula: string | null;
        sortOrder: number;
    }>): void {
        if (props.name !== undefined) this.name = props.name;
        if (props.lengthFormula !== undefined) this.lengthFormula = props.lengthFormula;
        if (props.widthFormula !== undefined) this.widthFormula = props.widthFormula;
        if (props.quantityFormula !== undefined) this.quantityFormula = props.quantityFormula;
        if (props.childProductId !== undefined) this.childProductId = props.childProductId;
        if (props.depthFormula !== undefined) this.depthFormula = props.depthFormula;
        if (props.extraVariables !== undefined) this.extraVariables = props.extraVariables;
        if (props.conditionFormula !== undefined) this.conditionFormula = props.conditionFormula;
        if (props.sortOrder !== undefined) this.sortOrder = props.sortOrder;
    }
}

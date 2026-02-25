/**
 * Схема компонента продукта (BOM - Bill of Materials)
 * Описывает деталь, из которой состоит продукт, и формулы для расчета её параметров.
 */
export class ProductComponentSchema {
    constructor(
        private id: number,
        private productId: number,
        private name: string,
        private lengthFormula: string,
        private widthFormula: string,
        private quantityFormula: string,
    ) { }

    /**
     * Создает новый экземпляр схемы компонента
     */
    static create(props: {
        productId: number;
        name: string;
        lengthFormula: string;
        widthFormula: string;
        quantityFormula: string;
    }): ProductComponentSchema {
        return new ProductComponentSchema(
            0,
            props.productId,
            props.name,
            props.lengthFormula,
            props.widthFormula,
            props.quantityFormula,
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
    }): ProductComponentSchema {
        return new ProductComponentSchema(
            props.id,
            props.productId,
            props.name,
            props.lengthFormula,
            props.widthFormula,
            props.quantityFormula,
        );
    }

    // Геттеры
    getId(): number { return this.id; }
    getProductId(): number { return this.productId; }
    getName(): string { return this.name; }
    getLengthFormula(): string { return this.lengthFormula; }
    getWidthFormula(): string { return this.widthFormula; }
    getQuantityFormula(): string { return this.quantityFormula; }

    // Сеттеры для обновления (если потребуется)
    update(props: Partial<{
        name: string;
        lengthFormula: string;
        widthFormula: string;
        quantityFormula: string;
    }>): void {
        if (props.name !== undefined) this.name = props.name;
        if (props.lengthFormula !== undefined) this.lengthFormula = props.lengthFormula;
        if (props.widthFormula !== undefined) this.widthFormula = props.widthFormula;
        if (props.quantityFormula !== undefined) this.quantityFormula = props.quantityFormula;
    }
}

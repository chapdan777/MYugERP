/**
 * Статус заказ-наряда
 * @description Доменная сущность справочника статусов ЗН
 */
export class WorkOrderStatusEntity {
    private id?: number;
    private code: string;
    private name: string;
    private color: string;
    private sortOrder: number;
    private isInitial: boolean;
    private isFinal: boolean;
    private isActive: boolean;
    private createdAt: Date;
    private updatedAt: Date;

    private constructor(props: {
        id?: number;
        code: string;
        name: string;
        color: string;
        sortOrder: number;
        isInitial: boolean;
        isFinal: boolean;
        isActive: boolean;
        createdAt?: Date;
        updatedAt?: Date;
    }) {
        this.id = props.id;
        this.code = props.code;
        this.name = props.name;
        this.color = props.color;
        this.sortOrder = props.sortOrder;
        this.isInitial = props.isInitial;
        this.isFinal = props.isFinal;
        this.isActive = props.isActive;
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? new Date();
    }

    /**
     * Создание нового статуса
     */
    static create(props: {
        code: string;
        name: string;
        color: string;
        sortOrder?: number;
        isInitial?: boolean;
        isFinal?: boolean;
        isActive?: boolean;
    }): WorkOrderStatusEntity {
        return new WorkOrderStatusEntity({
            code: props.code,
            name: props.name,
            color: props.color,
            sortOrder: props.sortOrder ?? 0,
            isInitial: props.isInitial ?? false,
            isFinal: props.isFinal ?? false,
            isActive: props.isActive ?? true,
        });
    }

    /**
     * Восстановление из БД
     */
    static restore(props: {
        id: number;
        code: string;
        name: string;
        color: string;
        sortOrder: number;
        isInitial: boolean;
        isFinal: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }): WorkOrderStatusEntity {
        return new WorkOrderStatusEntity(props);
    }

    /**
     * Обновление информации о статусе
     */
    updateInfo(props: {
        name?: string;
        color?: string;
        sortOrder?: number;
        isInitial?: boolean;
        isFinal?: boolean;
        isActive?: boolean;
    }): void {
        if (props.name !== undefined) this.name = props.name;
        if (props.color !== undefined) this.color = props.color;
        if (props.sortOrder !== undefined) this.sortOrder = props.sortOrder;
        if (props.isInitial !== undefined) this.isInitial = props.isInitial;
        if (props.isFinal !== undefined) this.isFinal = props.isFinal;
        if (props.isActive !== undefined) this.isActive = props.isActive;
        this.updatedAt = new Date();
    }

    // Геттеры
    getId(): number | undefined { return this.id; }
    getCode(): string { return this.code; }
    getName(): string { return this.name; }
    getColor(): string { return this.color; }
    getSortOrder(): number { return this.sortOrder; }
    getIsInitial(): boolean { return this.isInitial; }
    getIsFinal(): boolean { return this.isFinal; }
    getIsActive(): boolean { return this.isActive; }
    getCreatedAt(): Date { return this.createdAt; }
    getUpdatedAt(): Date { return this.updatedAt; }
}

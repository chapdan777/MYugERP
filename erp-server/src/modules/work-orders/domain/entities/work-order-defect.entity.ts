import { DomainException } from '../../../../common/exceptions/domain.exception';

export enum WorkOrderDefectStatus {
    PENDING = 'pending',
    RECTIFIED = 'rectified',
    CANCELLED = 'cancelled',
}

/**
 * WorkOrderDefect - Брак в заказ-наряде
 */
export class WorkOrderDefect {
    private id?: number;
    private workOrderId: number;
    private reason: string;
    private responsibleUserId: number | null;
    private status: WorkOrderDefectStatus;
    private createdAt: Date;
    private resolvedAt: Date | null;

    private constructor(props: {
        id?: number;
        workOrderId: number;
        reason: string;
        responsibleUserId: number | null;
        status: WorkOrderDefectStatus;
        createdAt: Date;
        resolvedAt: Date | null;
    }) {
        this.id = props.id;
        this.workOrderId = props.workOrderId;
        this.reason = props.reason;
        this.responsibleUserId = props.responsibleUserId;
        this.status = props.status;
        this.createdAt = props.createdAt;
        this.resolvedAt = props.resolvedAt;

        this.validate();
    }

    static create(props: {
        workOrderId: number;
        reason: string;
        responsibleUserId?: number | null;
    }): WorkOrderDefect {
        return new WorkOrderDefect({
            ...props,
            responsibleUserId: props.responsibleUserId ?? null,
            status: WorkOrderDefectStatus.PENDING,
            createdAt: new Date(),
            resolvedAt: null,
        });
    }

    static restore(props: {
        id: number;
        workOrderId: number;
        reason: string;
        responsibleUserId: number | null;
        status: WorkOrderDefectStatus;
        createdAt: Date;
        resolvedAt: Date | null;
    }): WorkOrderDefect {
        return new WorkOrderDefect(props);
    }

    private validate(): void {
        if (!this.reason) {
            throw new DomainException('Причина брака обязательна');
        }
    }

    markAsRectified(): void {
        if (this.status !== WorkOrderDefectStatus.PENDING) {
            throw new DomainException('Брак уже обработан');
        }
        this.status = WorkOrderDefectStatus.RECTIFIED;
        this.resolvedAt = new Date();
    }

    // Геттеры
    getId(): number | undefined {
        return this.id;
    }

    getWorkOrderId(): number {
        return this.workOrderId;
    }

    getReason(): string {
        return this.reason;
    }

    getResponsibleUserId(): number | null {
        return this.responsibleUserId;
    }

    getStatus(): WorkOrderDefectStatus {
        return this.status;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }

    getResolvedAt(): Date | null {
        return this.resolvedAt;
    }
}

export interface CncComponentData {
    name: string;
    length: number;
    width: number;
    quantity: number;
    quantityTotal: number;
    context: Record<string, any>;
}

export interface CncItemData {
    productName: string;
    orderItemId: number;
    quantity: number;
    components: CncComponentData[];
}

export interface CncData {
    workOrderId: number;
    workOrderNumber: string;
    operation: string;
    createdAt: string;
    items: CncItemData[];
}

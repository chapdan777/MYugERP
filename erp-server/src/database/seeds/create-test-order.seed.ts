import { DataSource } from 'typeorm';
import { OrderEntity } from '../../modules/orders/infrastructure/persistence/order.entity';
import { OrderSectionEntity } from '../../modules/orders/infrastructure/persistence/order-section.entity';
import { OrderItemEntity } from '../../modules/orders/infrastructure/persistence/order-item.entity';
import { PropertyInOrderEntity } from '../../modules/orders/infrastructure/persistence/property-in-order.entity';
import { PropertyEntity } from '../../modules/properties/infrastructure/persistence/property.entity';

export async function seedTestOrder(dataSource: DataSource): Promise<void> {
    const orderRepo = dataSource.getRepository(OrderEntity);
    const sectionRepo = dataSource.getRepository(OrderSectionEntity);
    const itemRepo = dataSource.getRepository(OrderItemEntity);
    const propInOrderRepo = dataSource.getRepository(PropertyInOrderEntity);
    const propertyRepo = dataSource.getRepository(PropertyEntity);

    console.log('--- Creating Test Order ---');

    // 1. Create Order
    const orderNumber = 'TEST-4955';
    let order = await orderRepo.findOne({ where: { orderNumber } });
    if (order) {
        // Correct deletion order to satisfy FK constraints
        const sections = await sectionRepo.find({ where: { order: { id: order.id } } });
        for (const section of sections) {
            const items = await itemRepo.find({ where: { section: { id: section.id } } });
            for (const item of items) {
                await propInOrderRepo.delete({ orderItem: { id: item.id } });
                await itemRepo.remove(item);
            }
            await sectionRepo.remove(section);
        }
        await orderRepo.remove(order);
    }

    order = await orderRepo.save(orderRepo.create({
        orderNumber,
        clientId: 1,
        clientName: 'Тестовый Клиент',
        status: 'NEW',
        paymentStatus: 'UNPAID',
        totalAmount: 0,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        documentType: 'Фасады',
        manager: 'Иванов И.И.',
        orderName: 'Тестовый проект М-Юг',
        launchDate: new Date(),
    }));

    // 1.2 Get Property Header
    const headerRepo = dataSource.getRepository('PropertyHeaderEntity');
    const header = await headerRepo.findOne({ where: { name: 'Параметры отделки' } });

    // 2. Create Section
    const section = await sectionRepo.save(sectionRepo.create({
        order: order,
        sectionNumber: 1,
        name: 'Фасадная',
        headerId: (header as any)?.id || null
    }));

    // 3. Properties to add
    const props = await propertyRepo.find();
    const propsMap: Record<string, PropertyEntity> = {};
    props.forEach(p => propsMap[p.code] = p);

    const createItem = async (name: string, productId: number, length: number, width: number, qty: number, itemProps: Record<string, string>) => {
        const item = await itemRepo.save(itemRepo.create({
            section: section,
            productId,
            productName: name,
            length,
            width,
            depth: 20,
            quantity: qty,
            unit: 1, // шт
            coefficient: 1,
            basePrice: 1000,
            finalPrice: 1000,
            totalPrice: 1000 * qty
        }));

        for (const [code, value] of Object.entries(itemProps)) {
            const p = propsMap[code];
            if (p) {
                await propInOrderRepo.save(propInOrderRepo.create({
                    orderItem: item,
                    propertyId: p.id,
                    propertyCode: p.code,
                    propertyName: p.name,
                    value
                }));
            } else {
                console.warn(`Property with code ${code} not found!`);
            }
        }
        return item;
    };

    // Item 1: Enamel with Patina
    await createItem('Фасад рамочный (Белый+Золото)', 5, 716, 396, 5, {
        'W_PR': '70',
        'W_PR_BOTTOM': '70',
        'FASKA': '2',
        'GP': '10',
        'T_PR': '20',
        'T_PAZ': '10',
        'color': 'Белый',
        'patina': 'Золото',
        'gloss': 'Матовый',
        'texture': 'прямая'
    });

    // Item 2: Stain (Wood)
    await createItem('Фасад рамочный (Дуб)', 5, 716, 146, 2, {
        'W_PR': '70',
        'W_PR_BOTTOM': '70',
        'FASKA': '2',
        'GP': '10',
        'T_PR': '20',
        'T_PAZ': '10',
        'color': 'Дуб',
        'patina': 'Нет',
        'gloss': 'Матовый',
        'texture': 'прямая'
    });

    console.log(`  Test order ${order.orderNumber} created successfully.`);
}

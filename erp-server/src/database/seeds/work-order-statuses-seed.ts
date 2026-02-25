import { DataSource } from 'typeorm';
import { WorkOrderStatusOrmEntity } from '../../modules/work-orders/infrastructure/persistence/entities/work-order-status.entity';

/**
 * Seed для статусов заказ-нарядов
 */
export async function seedWorkOrderStatuses(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(WorkOrderStatusOrmEntity);

    const statuses = [
        {
            code: 'PLANNED',
            name: 'Запланирован',
            color: '#e0e0e0', // Grey
            description: 'Заказ-наряд создан, но еще не назначен.',
            isInitial: true,
            isFinal: false,
            isActive: true,
            sortOrder: 10,
        },
        {
            code: 'ASSIGNED',
            name: 'Назначен',
            color: '#2196f3', // Blue
            description: 'Заказ-наряд назначен исполнителю.',
            isInitial: false,
            isFinal: false,
            isActive: true,
            sortOrder: 20,
        },
        {
            code: 'IN_PROGRESS',
            name: 'В работе',
            color: '#ff9800', // Orange
            description: 'Исполнитель приступил к выполнению работ.',
            isInitial: false,
            isFinal: false,
            isActive: true,
            sortOrder: 30,
        },
        {
            code: 'QUALITY_CHECK',
            name: 'Контроль качества',
            color: '#9c27b0', // Purple
            description: 'Работы выполнены, ожидается проверка качества.',
            isInitial: false,
            isFinal: false,
            isActive: true,
            sortOrder: 40,
        },
        {
            code: 'COMPLETED',
            name: 'Завершен',
            color: '#4caf50', // Green
            description: 'Заказ-наряд успешно завершен и проверен.',
            isInitial: false,
            isFinal: true,
            isActive: true,
            sortOrder: 50,
        },
        {
            code: 'CANCELLED',
            name: 'Отменен',
            color: '#f44336', // Red
            description: 'Заказ-наряд отменен.',
            isInitial: false,
            isFinal: true,
            isActive: true,
            sortOrder: 60,
        },
    ];

    console.log('🌱 Seeding work order statuses...');

    for (const statusData of statuses) {
        const existingStatus = await repository.findOne({ where: { code: statusData.code } });

        if (!existingStatus) {
            const newStatus = repository.create(statusData);
            await repository.save(newStatus);
            console.log(`   ✅ Created status: ${statusData.name} (${statusData.code})`);
        } else {
            // Обновляем существующий статус
            existingStatus.name = statusData.name;
            existingStatus.color = statusData.color;
            existingStatus.description = statusData.description;
            existingStatus.isInitial = statusData.isInitial;
            existingStatus.isFinal = statusData.isFinal;
            existingStatus.sortOrder = statusData.sortOrder;
            await repository.save(existingStatus);
            console.log(`   ⏭️  Status updated: ${statusData.name} (${statusData.code})`);
        }
    }

    console.log('✅ Work order statuses seed completed');
}

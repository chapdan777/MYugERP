import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IAuditLogRepository, AuditLogFilters } from '../../domain/repositories/audit-log.repository.interface';
import { AuditLog } from '../../domain/entities/audit-log.entity';
import { AuditLogEntity } from './audit-log.entity';
import { AuditLogMapper } from './audit-log.mapper';

/**
 * TypeORM реализация репозитория AuditLog
 */
@Injectable()
export class AuditLogRepository implements IAuditLogRepository {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly repository: Repository<AuditLogEntity>,
  ) {}

  async save(auditLog: AuditLog): Promise<AuditLog> {
    const entity = AuditLogMapper.toPersistence(auditLog);
    const saved = await this.repository.save(entity);
    return AuditLogMapper.toDomain(saved);
  }

  async findById(id: number): Promise<AuditLog | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? AuditLogMapper.toDomain(entity) : null;
  }

  async findAll(filters?: AuditLogFilters): Promise<AuditLog[]> {
    const queryBuilder = this.repository.createQueryBuilder('audit');

    if (filters) {
      if (filters.userId) {
        queryBuilder.andWhere('audit.userId = :userId', { userId: filters.userId });
      }
      if (filters.username) {
        queryBuilder.andWhere('audit.username LIKE :username', { username: `%${filters.username}%` });
      }
      if (filters.action) {
        queryBuilder.andWhere('audit.action = :action', { action: filters.action });
      }
      if (filters.entityType) {
        queryBuilder.andWhere('audit.entityType = :entityType', { entityType: filters.entityType });
      }
      if (filters.entityId) {
        queryBuilder.andWhere('audit.entityId = :entityId', { entityId: filters.entityId });
      }
      if (filters.startDate && filters.endDate) {
        queryBuilder.andWhere('audit.createdAt BETWEEN :startDate AND :endDate', {
          startDate: filters.startDate,
          endDate: filters.endDate,
        });
      } else if (filters.startDate) {
        queryBuilder.andWhere('audit.createdAt >= :startDate', { startDate: filters.startDate });
      } else if (filters.endDate) {
        queryBuilder.andWhere('audit.createdAt <= :endDate', { endDate: filters.endDate });
      }
    }

    queryBuilder.orderBy('audit.createdAt', 'DESC');
    
    const entities = await queryBuilder.getMany();
    return AuditLogMapper.toDomainList(entities);
  }

  async findByUserId(userId: number, limit: number = 100): Promise<AuditLog[]> {
    const entities = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return AuditLogMapper.toDomainList(entities);
  }

  async findByEntityType(entityType: string, limit: number = 100): Promise<AuditLog[]> {
    const entities = await this.repository.find({
      where: { entityType },
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return AuditLogMapper.toDomainList(entities);
  }

  async findByAction(action: string, limit: number = 100): Promise<AuditLog[]> {
    const entities = await this.repository.find({
      where: { action },
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return AuditLogMapper.toDomainList(entities);
  }
}

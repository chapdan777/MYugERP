import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { UserEntity } from './user.entity';
import { UserMapper } from './user.mapper';
import { UserRole } from '../../domain/enums';

/**
 * TypeORM реализация репозитория User
 * Адаптер в терминах Clean Architecture
 */
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async save(user: User): Promise<User> {
    const entity = UserMapper.toPersistence(user);
    const saved = await this.repository.save(entity);
    return UserMapper.toDomain(saved);
  }

  async findById(id: number): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { username } });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { email } });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findByRole(role: UserRole): Promise<User[]> {
    const entities = await this.repository.find({
      where: { role: role as string },
    });
    return UserMapper.toDomainList(entities);
  }

  async findAllActive(): Promise<User[]> {
    const entities = await this.repository.find({
      where: { isActive: true, isDeleted: false },
    });
    return UserMapper.toDomainList(entities);
  }

  async findAll(): Promise<User[]> {
    const entities = await this.repository.find();
    return UserMapper.toDomainList(entities);
  }

  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.repository.count({ where: { username } });
    return count > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repository.count({ where: { email } });
    return count > 0;
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}


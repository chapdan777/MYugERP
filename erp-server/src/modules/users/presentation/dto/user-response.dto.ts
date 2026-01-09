import { User } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/enums';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO для пользователя (без чувствительных данных)
 */
export class UserResponseDto {
  @ApiProperty({ 
    description: 'Уникальный идентификатор пользователя', 
    example: 1 
  })
  id: number;
  
  @ApiProperty({ 
    description: 'Имя пользователя', 
    example: 'john_doe' 
  })
  username: string;
  
  @ApiProperty({ 
    description: 'Роль пользователя', 
    enum: UserRole,
    example: UserRole.ADMIN 
  })
  role: UserRole;
  
  @ApiProperty({ 
    description: 'Полное имя пользователя', 
    example: 'John Doe',
    nullable: true 
  })
  fullName: string | null;
  
  @ApiProperty({ 
    description: 'Email пользователя', 
    example: 'john@example.com',
    nullable: true 
  })
  email: string | null;
  
  @ApiProperty({ 
    description: 'Номер телефона', 
    example: '+79991234567',
    nullable: true 
  })
  phone: string | null;
  
  @ApiProperty({ 
    description: 'Статус активности пользователя', 
    example: true 
  })
  isActive: boolean;
  
  @ApiProperty({ 
    description: 'Дата создания', 
    example: '2024-01-01T00:00:00.000Z' 
  })
  createdAt: Date;
  
  @ApiProperty({ 
    description: 'Дата последнего обновления', 
    example: '2024-01-01T00:00:00.000Z' 
  })
  updatedAt: Date;
  
  @ApiProperty({ 
    description: 'Дата последнего входа', 
    example: '2024-01-01T00:00:00.000Z',
    nullable: true 
  })
  lastLoginAt: Date | null;

  constructor(user: User) {
    this.id = user.getId()!;
    this.username = user.getUsername();
    this.role = user.getRole();
    this.fullName = user.getFullName();
    this.email = user.getEmail()?.getValue() ?? null;
    this.phone = user.getPhone()?.getValue() ?? null;
    this.isActive = user.getIsActive();
    this.createdAt = user.getCreatedAt();
    this.updatedAt = user.getUpdatedAt();
    this.lastLoginAt = user.getLastLoginAt();
  }

  /**
   * Преобразование доменной модели User в DTO
   */
  static fromDomain(user: User): UserResponseDto {
    return new UserResponseDto(user);
  }

  /**
   * Преобразование массива доменных моделей в массив DTO
   */
  static fromDomainList(users: User[]): UserResponseDto[] {
    return users.map((user) => UserResponseDto.fromDomain(user));
  }
}

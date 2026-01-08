import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../../modules/users/infrastructure/persistence/user.entity';

/**
 * Начальная инициализация базы данных
 * Создание администратора по умолчанию
 */
export async function runInitialSeed(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(UserEntity);

  // Проверяем, существует ли уже администратор
  const existingAdmin = await userRepository.findOne({
    where: { username: 'admin' },
  });

  if (existingAdmin) {
    console.log('Admin user already exists, skipping seed...');
    return;
  }

  // Создаем администратора по умолчанию
  const passwordHash = await bcrypt.hash('admin123', 10);

  const adminUser = userRepository.create({
    username: 'admin',
    passwordHash,
    role: 'admin',
    fullName: 'System Administrator',
    email: 'admin@example.com',
    phone: null,
    isActive: true,
    isDeleted: false,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await userRepository.save(adminUser);

  console.log('✅ Admin user created successfully:');
  console.log('   Username: admin');
  console.log('   Password: admin123');
  console.log('   Role: admin');
  console.log('⚠️  ВАЖНО: Измените пароль администратора после первого входа!');
}


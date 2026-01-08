import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Начальная миграция: создание всех таблиц ERP-системы
 * Следует проектному документу production-erp-server.md
 */
export class InitialSchema1704710000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ==================== ДОМЕН: ПОЛЬЗОВАТЕЛИ ====================
    
    // Таблица пользователей (клиенты, менеджеры, работники)
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL PRIMARY KEY,
        "username" VARCHAR(255) NOT NULL UNIQUE,
        "password_hash" VARCHAR(255) NOT NULL,
        "full_name" VARCHAR(255) NOT NULL,
        "email" VARCHAR(255),
        "role" VARCHAR(50) NOT NULL CHECK (role IN ('client', 'manager', 'worker', 'admin')),
        "person_type" VARCHAR(50)[],
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Дополнительные свойства пользователей
    await queryRunner.query(`
      CREATE TABLE "user_properties" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "property_key" VARCHAR(100) NOT NULL,
        "property_value" TEXT,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("user_id", "property_key")
      )
    `);

    // ==================== ДОМЕН: НОМЕНКЛАТУРА ====================
    
    // Номенклатура (продукты)
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL,
        "category" VARCHAR(100),
        "description" TEXT,
        "unit" VARCHAR(20) NOT NULL CHECK (unit IN ('m2', 'linear_meter', 'piece')),
        "default_length" DECIMAL(10, 2),
        "default_width" DECIMAL(10, 2),
        "default_depth" DECIMAL(10, 2),
        "base_price" DECIMAL(12, 2) NOT NULL DEFAULT 0,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ==================== ДОМЕН: СВОЙСТВА ====================
    
    // Свойства (атрибуты продуктов)
    await queryRunner.query(`
      CREATE TABLE "properties" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL,
        "type" VARCHAR(50) NOT NULL CHECK (type IN ('string', 'number', 'boolean', 'enum')),
        "category" VARCHAR(100),
        "possible_values" TEXT[],
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Связь продуктов со свойствами
    await queryRunner.query(`
      CREATE TABLE "product_properties" (
        "id" SERIAL PRIMARY KEY,
        "product_id" INTEGER NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
        "property_id" INTEGER NOT NULL REFERENCES "properties"("id") ON DELETE CASCADE,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "default_value" TEXT,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("product_id", "property_id")
      )
    `);

    // Зависимости значений свойств
    await queryRunner.query(`
      CREATE TABLE "property_dependencies" (
        "id" SERIAL PRIMARY KEY,
        "source_property_id" INTEGER NOT NULL REFERENCES "properties"("id") ON DELETE CASCADE,
        "source_value" TEXT NOT NULL,
        "target_property_id" INTEGER NOT NULL REFERENCES "properties"("id") ON DELETE CASCADE,
        "target_value" TEXT NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ==================== ДОМЕН: ЦЕНООБРАЗОВАНИЕ ====================
    
    // Модификаторы цен
    await queryRunner.query(`
      CREATE TABLE "price_modifiers" (
        "id" SERIAL PRIMARY KEY,
        "product_id" INTEGER REFERENCES "products"("id") ON DELETE CASCADE,
        "property_id" INTEGER NOT NULL REFERENCES "properties"("id") ON DELETE CASCADE,
        "property_value" TEXT NOT NULL,
        "price_change" DECIMAL(12, 2) NOT NULL,
        "change_type" VARCHAR(20) NOT NULL CHECK (change_type IN ('absolute', 'percentage')),
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ==================== ДОМЕН: КОНФИГУРАЦИЯ ====================
    
    // Шаблоны заказов
    await queryRunner.query(`
      CREATE TABLE "order_templates" (
        "id" SERIAL PRIMARY KEY,
        "order_type" VARCHAR(100) NOT NULL UNIQUE,
        "name" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Шаблоны шапок заказов
    await queryRunner.query(`
      CREATE TABLE "order_section_templates" (
        "id" SERIAL PRIMARY KEY,
        "section_type" VARCHAR(100) NOT NULL,
        "name" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Свойства в шаблоне шапки
    await queryRunner.query(`
      CREATE TABLE "section_template_properties" (
        "id" SERIAL PRIMARY KEY,
        "section_template_id" INTEGER NOT NULL REFERENCES "order_section_templates"("id") ON DELETE CASCADE,
        "property_id" INTEGER NOT NULL REFERENCES "properties"("id") ON DELETE CASCADE,
        "is_enabled" BOOLEAN NOT NULL DEFAULT true,
        "is_required" BOOLEAN NOT NULL DEFAULT false,
        "display_order" INTEGER NOT NULL DEFAULT 0,
        UNIQUE("section_template_id", "property_id")
      )
    `);

    // ==================== ДОМЕН: ЗАКАЗЫ ====================
    
    // Заказы
    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" SERIAL PRIMARY KEY,
        "number_order" VARCHAR(50) NOT NULL UNIQUE,
        "type_order" VARCHAR(100) NOT NULL,
        "name_order" VARCHAR(255) NOT NULL,
        "date_order" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "date_start" TIMESTAMP,
        "date_complete" TIMESTAMP,
        "client_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "agent_id" INTEGER REFERENCES "users"("id"),
        "note" TEXT,
        "status" VARCHAR(50) NOT NULL DEFAULT 'draft',
        "is_locked" BOOLEAN NOT NULL DEFAULT false,
        "locked_by_user_id" INTEGER REFERENCES "users"("id"),
        "locked_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Шапки заказов
    await queryRunner.query(`
      CREATE TABLE "order_sections" (
        "id" SERIAL PRIMARY KEY,
        "order_id" INTEGER NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
        "section_template_id" INTEGER REFERENCES "order_section_templates"("id"),
        "section_name" VARCHAR(255) NOT NULL,
        "display_order" INTEGER NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Позиции заказов
    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" SERIAL PRIMARY KEY,
        "order_section_id" INTEGER NOT NULL REFERENCES "order_sections"("id") ON DELETE CASCADE,
        "product_id" INTEGER NOT NULL REFERENCES "products"("id"),
        "quantity" INTEGER NOT NULL DEFAULT 1,
        "length" DECIMAL(10, 2),
        "width" DECIMAL(10, 2),
        "depth" DECIMAL(10, 2),
        "calculated_area" DECIMAL(12, 4),
        "calculated_linear_meter" DECIMAL(12, 4),
        "base_price" DECIMAL(12, 2) NOT NULL,
        "final_price" DECIMAL(12, 2) NOT NULL,
        "coefficient" DECIMAL(6, 4) NOT NULL DEFAULT 1.0,
        "note" TEXT,
        "has_conflict" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Значения свойств в позициях
    await queryRunner.query(`
      CREATE TABLE "properties_in_order" (
        "id" SERIAL PRIMARY KEY,
        "order_item_id" INTEGER NOT NULL REFERENCES "order_items"("id") ON DELETE CASCADE,
        "property_id" INTEGER NOT NULL REFERENCES "properties"("id"),
        "property_value" TEXT NOT NULL,
        "is_enabled" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("order_item_id", "property_id")
      )
    `);

    // История изменений заказов
    await queryRunner.query(`
      CREATE TABLE "order_logs" (
        "id" SERIAL PRIMARY KEY,
        "order_id" INTEGER NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
        "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "change_type" VARCHAR(100) NOT NULL,
        "change_description" TEXT NOT NULL,
        "change_data" JSONB,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ==================== ДОМЕН: ПРОИЗВОДСТВО ====================
    
    // Операции
    await queryRunner.query(`
      CREATE TABLE "operations" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "property_id" INTEGER REFERENCES "properties"("id"),
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Расценки операций
    await queryRunner.query(`
      CREATE TABLE "operation_rates" (
        "id" SERIAL PRIMARY KEY,
        "operation_id" INTEGER NOT NULL REFERENCES "operations"("id") ON DELETE CASCADE,
        "rate_type" VARCHAR(50) NOT NULL CHECK (rate_type IN ('piece_rate', 'time_based', 'per_unit')),
        "rate_value" DECIMAL(12, 2) NOT NULL,
        "unit_type" VARCHAR(50) NOT NULL CHECK (unit_type IN ('m2', 'linear_meter', 'piece', 'hour')),
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Технологические маршруты
    await queryRunner.query(`
      CREATE TABLE "technological_routes" (
        "id" SERIAL PRIMARY KEY,
        "product_id" INTEGER NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
        "property_set_hash" VARCHAR(255),
        "is_default" BOOLEAN NOT NULL DEFAULT false,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Шаги маршрута
    await queryRunner.query(`
      CREATE TABLE "route_steps" (
        "id" SERIAL PRIMARY KEY,
        "route_id" INTEGER NOT NULL REFERENCES "technological_routes"("id") ON DELETE CASCADE,
        "operation_id" INTEGER NOT NULL REFERENCES "operations"("id"),
        "step_order" INTEGER NOT NULL,
        "depends_on_step_id" INTEGER REFERENCES "route_steps"("id"),
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Производственные участки
    await queryRunner.query(`
      CREATE TABLE "production_departments" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "status" VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unavailable', 'maintenance', 'decommissioned')),
        "work_order_grouping_strategy" VARCHAR(50) NOT NULL DEFAULT 'unified' CHECK (work_order_grouping_strategy IN ('by_property', 'unified')),
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Операции участка
    await queryRunner.query(`
      CREATE TABLE "department_operations" (
        "id" SERIAL PRIMARY KEY,
        "department_id" INTEGER NOT NULL REFERENCES "production_departments"("id") ON DELETE CASCADE,
        "operation_id" INTEGER NOT NULL REFERENCES "operations"("id") ON DELETE CASCADE,
        "is_preferred" BOOLEAN NOT NULL DEFAULT false,
        "priority" INTEGER NOT NULL DEFAULT 0,
        UNIQUE("department_id", "operation_id")
      )
    `);

    // Заказ-наряды
    await queryRunner.query(`
      CREATE TABLE "work_orders" (
        "id" SERIAL PRIMARY KEY,
        "order_id" INTEGER NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
        "department_id" INTEGER NOT NULL REFERENCES "production_departments"("id"),
        "work_order_number" VARCHAR(50) NOT NULL UNIQUE,
        "status" VARCHAR(50) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'assigned', 'in_progress', 'quality_check', 'completed')),
        "priority" INTEGER NOT NULL DEFAULT 0,
        "planned_start_date" TIMESTAMP,
        "actual_start_date" TIMESTAMP,
        "planned_completion_date" TIMESTAMP,
        "actual_completion_date" TIMESTAMP,
        "standard_hours" DECIMAL(10, 2),
        "actual_hours" DECIMAL(10, 2),
        "piece_rate" DECIMAL(12, 2),
        "calculated_salary" DECIMAL(12, 2),
        "material_quantity" DECIMAL(12, 4),
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Позиции заказ-нарядов
    await queryRunner.query(`
      CREATE TABLE "work_order_items" (
        "id" SERIAL PRIMARY KEY,
        "work_order_id" INTEGER NOT NULL REFERENCES "work_orders"("id") ON DELETE CASCADE,
        "order_item_id" INTEGER NOT NULL REFERENCES "order_items"("id"),
        "operation_id" INTEGER NOT NULL REFERENCES "operations"("id"),
        "quantity" INTEGER NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ==================== ДОМЕН: ТРУДОВЫЕ РЕСУРСЫ ====================
    
    // Квалификации работников
    await queryRunner.query(`
      CREATE TABLE "worker_qualifications" (
        "id" SERIAL PRIMARY KEY,
        "worker_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "operation_id" INTEGER NOT NULL REFERENCES "operations"("id") ON DELETE CASCADE,
        "qualification_level" VARCHAR(50) NOT NULL CHECK (qualification_level IN ('trainee', 'qualified', 'expert')),
        "acquired_date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("worker_id", "operation_id")
      )
    `);

    // Назначения работников на заказ-наряды
    await queryRunner.query(`
      CREATE TABLE "worker_assignments" (
        "id" SERIAL PRIMARY KEY,
        "work_order_id" INTEGER NOT NULL REFERENCES "work_orders"("id") ON DELETE CASCADE,
        "worker_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "assignment_date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "role" VARCHAR(50) NOT NULL DEFAULT 'primary' CHECK (role IN ('primary', 'assistant'))
      )
    `);

    // Профили заработной платы
    await queryRunner.query(`
      CREATE TABLE "salary_profiles" (
        "id" SERIAL PRIMARY KEY,
        "worker_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "salary_type" VARCHAR(50) NOT NULL CHECK (salary_type IN ('piece_rate', 'time_based', 'fixed')),
        "hourly_rate" DECIMAL(10, 2),
        "fixed_monthly_salary" DECIMAL(12, 2),
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ==================== ДОМЕН: БУХГАЛТЕРИЯ ====================
    
    // Платежи
    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" SERIAL PRIMARY KEY,
        "client_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "payment_date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "amount" DECIMAL(12, 2) NOT NULL,
        "payment_method" VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'card')),
        "purpose" TEXT,
        "registered_by_user_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Баланс клиентов
    await queryRunner.query(`
      CREATE TABLE "client_balances" (
        "id" SERIAL PRIMARY KEY,
        "client_id" INTEGER NOT NULL REFERENCES "users"("id") UNIQUE,
        "current_balance" DECIMAL(12, 2) NOT NULL DEFAULT 0,
        "total_paid" DECIMAL(12, 2) NOT NULL DEFAULT 0,
        "total_allocated" DECIMAL(12, 2) NOT NULL DEFAULT 0,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Распределение оплат по заказам
    await queryRunner.query(`
      CREATE TABLE "order_payment_allocations" (
        "id" SERIAL PRIMARY KEY,
        "order_id" INTEGER NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
        "payment_id" INTEGER REFERENCES "payments"("id"),
        "allocation_amount" DECIMAL(12, 2) NOT NULL,
        "allocation_date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "allocated_by_user_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ==================== ДОМЕН: АУДИТ ====================
    
    // Журнал аудита
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" SERIAL PRIMARY KEY,
        "timestamp" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "user_id" INTEGER REFERENCES "users"("id"),
        "entity_type" VARCHAR(100) NOT NULL,
        "entity_id" INTEGER,
        "action" VARCHAR(50) NOT NULL CHECK (action IN ('create', 'update', 'delete', 'status_change')),
        "description" TEXT NOT NULL,
        "old_value" JSONB,
        "new_value" JSONB,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ==================== ИНДЕКСЫ ====================
    
    // Индексы для пользователей
    await queryRunner.query(`CREATE INDEX "idx_users_role" ON "users"("role")`);
    await queryRunner.query(`CREATE INDEX "idx_users_is_active" ON "users"("is_active")`);
    
    // Индексы для заказов
    await queryRunner.query(`CREATE INDEX "idx_orders_client_id" ON "orders"("client_id")`);
    await queryRunner.query(`CREATE INDEX "idx_orders_agent_id" ON "orders"("agent_id")`);
    await queryRunner.query(`CREATE INDEX "idx_orders_status" ON "orders"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_orders_date_complete" ON "orders"("date_complete")`);
    
    // Индексы для заказ-нарядов
    await queryRunner.query(`CREATE INDEX "idx_work_orders_order_id" ON "work_orders"("order_id")`);
    await queryRunner.query(`CREATE INDEX "idx_work_orders_department_id" ON "work_orders"("department_id")`);
    await queryRunner.query(`CREATE INDEX "idx_work_orders_status" ON "work_orders"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_work_orders_priority" ON "work_orders"("priority")`);
    
    // Индексы для платежей
    await queryRunner.query(`CREATE INDEX "idx_payments_client_id" ON "payments"("client_id")`);
    await queryRunner.query(`CREATE INDEX "idx_payments_date" ON "payments"("payment_date")`);
    
    // Индексы для аудита
    await queryRunner.query(`CREATE INDEX "idx_audit_logs_user_id" ON "audit_logs"("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_audit_logs_entity" ON "audit_logs"("entity_type", "entity_id")`);
    await queryRunner.query(`CREATE INDEX "idx_audit_logs_timestamp" ON "audit_logs"("timestamp")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаление таблиц в обратном порядке (с учетом зависимостей)
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "order_payment_allocations" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "client_balances" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payments" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "salary_profiles" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "worker_assignments" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "worker_qualifications" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "work_order_items" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "work_orders" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "department_operations" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "production_departments" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "route_steps" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "technological_routes" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "operation_rates" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "operations" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "order_logs" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "properties_in_order" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "order_items" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "order_sections" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "orders" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "section_template_properties" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "order_section_templates" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "order_templates" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "price_modifiers" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "property_dependencies" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product_properties" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "properties" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "products" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_properties" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);
  }
}

import { Injectable, Inject } from '@nestjs/common';
import { PROPERTY_DEPENDENCY_REPOSITORY } from '../repositories/injection-tokens';
import { IPropertyDependencyRepository } from '../repositories/property-dependency.repository.interface';
import { PropertyDependency } from '../entities/property-dependency.entity';
import { DependencyType } from '../enums/dependency-type.enum';
import { PROPERTY_REPOSITORY } from '../repositories/injection-tokens';
import { IPropertyRepository } from '../repositories/property.repository.interface';

/**
 * Результат разрешения зависимостей
 */
export interface DependencyResolutionResult {
  requiredProperties: number[];      // Свойства, которые должны быть заполнены
  excludedProperties: number[];      // Свойства, которые должны быть недоступны
  enabledProperties: number[];       // Свойства, которые становятся доступными
  propertyValues: Map<number, string>; // Свойства с автоматически установленными значениями
  errors: string[];                  // Ошибки валидации (например, конфликты)
}

/**
 * Значение свойства в контексте заказа
 */
export interface PropertyValue {
  propertyId: number;
  value: string | null;
}

/**
 * Сервис для автоматического разрешения зависимостей свойств
 * Это доменный сервис, так как логика не принадлежит одной сущности
 */
@Injectable()
export class PropertyDependencyResolverService {
  constructor(
    @Inject(PROPERTY_DEPENDENCY_REPOSITORY)
    private readonly dependencyRepository: IPropertyDependencyRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
  ) { }

  /**
   * Разрешить зависимости для текущего набора значений свойств
   * @param propertyValues Текущие значения свойств
   * @returns Результат разрешения зависимостей
   */
  async resolveDependencies(
    propertyValues: PropertyValue[],
  ): Promise<DependencyResolutionResult> {
    const result: DependencyResolutionResult = {
      requiredProperties: [],
      excludedProperties: [],
      enabledProperties: [],
      propertyValues: new Map(),
      errors: [],
    };

    // Получаем все активные зависимости
    const allDependencies = await this.dependencyRepository.findAllActive();

    // Создаем карту значений для быстрого доступа
    const valueMap = new Map<number, string | null>();
    propertyValues.forEach(pv => valueMap.set(pv.propertyId, pv.value));

    // Обрабатываем каждую зависимость
    for (const dependency of allDependencies) {
      const sourceValue = valueMap.get(dependency.getSourcePropertyId()) ?? null;

      // Проверяем, срабатывает ли зависимость
      if (!dependency.isTriggeredBy(sourceValue)) {
        continue;
      }

      // Обрабатываем зависимость в зависимости от типа
      this.applyDependency(dependency, result);
    }

    // Проверяем на конфликты
    this.validateResult(result);

    return result;
  }

  /**
   * Проверить, все ли обязательные свойства заполнены
   */
  async validateRequiredProperties(
    propertyValues: PropertyValue[],
    resolutionResult: DependencyResolutionResult,
  ): Promise<string[]> {
    const errors: string[] = [];
    const valueMap = new Map<number, string | null>();
    propertyValues.forEach(pv => valueMap.set(pv.propertyId, pv.value));

    // Проверяем обязательные свойства
    for (const requiredPropertyId of resolutionResult.requiredProperties) {
      const value = valueMap.get(requiredPropertyId);
      if (!value || value.trim().length === 0) {
        errors.push(
          `Свойство с ID ${requiredPropertyId} обязательно для заполнения из-за зависимостей`,
        );
      }
    }

    return errors;
  }

  /**
   * Проверить, не используются ли исключенные свойства
   */
  async validateExcludedProperties(
    propertyValues: PropertyValue[],
    resolutionResult: DependencyResolutionResult,
  ): Promise<string[]> {
    const errors: string[] = [];
    const valueMap = new Map<number, string | null>();
    propertyValues.forEach(pv => valueMap.set(pv.propertyId, pv.value));

    // Проверяем исключенные свойства
    for (const excludedPropertyId of resolutionResult.excludedProperties) {
      const value = valueMap.get(excludedPropertyId);
      if (value && value.trim().length > 0) {
        errors.push(
          `Свойство с ID ${excludedPropertyId} недоступно из-за зависимостей`,
        );
      }
    }

    return errors;
  }

  /**
   * Применить конкретную зависимость
   */
  private applyDependency(
    dependency: PropertyDependency,
    result: DependencyResolutionResult,
  ): void {
    const targetPropertyId = dependency.getTargetPropertyId();

    switch (dependency.getDependencyType()) {
      case DependencyType.REQUIRES:
        // Добавляем в список обязательных, если еще не добавлено
        if (!result.requiredProperties.includes(targetPropertyId)) {
          result.requiredProperties.push(targetPropertyId);
        }
        break;

      case DependencyType.EXCLUDES:
        // Добавляем в список исключенных
        if (!result.excludedProperties.includes(targetPropertyId)) {
          result.excludedProperties.push(targetPropertyId);
        }
        // Если свойство было в enabled, удаляем его
        const enabledIndex = result.enabledProperties.indexOf(targetPropertyId);
        if (enabledIndex !== -1) {
          result.enabledProperties.splice(enabledIndex, 1);
        }
        break;

      case DependencyType.ENABLES:
        // Добавляем в список доступных, если не исключено
        if (
          !result.excludedProperties.includes(targetPropertyId) &&
          !result.enabledProperties.includes(targetPropertyId)
        ) {
          result.enabledProperties.push(targetPropertyId);
        }
        break;

      case DependencyType.SETS_VALUE:
        // Устанавливаем значение, если не исключено
        if (!result.excludedProperties.includes(targetPropertyId)) {
          const targetValue = dependency.getTargetValue();
          if (targetValue) {
            result.propertyValues.set(targetPropertyId, targetValue);
          }
        }
        break;

      case DependencyType.INHERITS:
        // Наследование обрабатывается отдельно через resolveForChildProduct
        // Здесь ничего не делаем — этот тип работает между уровнями
        break;
    }
  }

  /**
   * Валидация результата на конфликты
   */
  private validateResult(result: DependencyResolutionResult): void {
    // Проверяем, нет ли свойства одновременно в required и excluded
    for (const requiredId of result.requiredProperties) {
      if (result.excludedProperties.includes(requiredId)) {
        result.errors.push(
          `Конфликт зависимостей: свойство ${requiredId} одновременно обязательно и исключено`,
        );
      }
    }

    // Проверяем, нет ли свойства одновременно в enabled и excluded
    for (const enabledId of result.enabledProperties) {
      if (result.excludedProperties.includes(enabledId)) {
        result.errors.push(
          `Конфликт зависимостей: свойство ${enabledId} одновременно включено и исключено`,
        );
      }
    }
  }

  /**
   * Разрешить наследованные значения свойств от родительского продукта к дочернему.
   * Ищет зависимости типа INHERITS, где sourcePropertyId принадлежит родителю,
   * и если у дочернего есть свойство с тем же кодом — передаёт значение.
   *
   * @param parentPropertyValues Значения свойств родительского продукта
   * @param childPropertyIds Список ID свойств дочернего продукта
   * @returns Map<childPropertyId, inheritedValue> — унаследованные значения
   */
  async resolveForChildProduct(
    parentPropertyValues: PropertyValue[],
    childPropertyIds: number[],
  ): Promise<Map<number, string>> {
    const inheritedValues = new Map<number, string>();

    // Получаем все активные зависимости типа INHERITS
    const allDeps = await this.dependencyRepository.findAllActive();
    const inheritDeps = allDeps.filter(
      d => d.getDependencyType() === DependencyType.INHERITS,
    );

    if (inheritDeps.length === 0) {
      // Нет зависимостей INHERITS — пробуем сопоставить по коду свойства
      return this.resolveByPropertyCode(parentPropertyValues, childPropertyIds);
    }

    // Создаём карту значений родителя
    const parentValueMap = new Map<number, string>();
    for (const pv of parentPropertyValues) {
      if (pv.value) {
        parentValueMap.set(pv.propertyId, pv.value);
      }
    }

    // Для каждой зависимости INHERITS проверяем, есть ли значение у родителя
    for (const dep of inheritDeps) {
      const sourceId = dep.getSourcePropertyId();
      const targetId = dep.getTargetPropertyId();

      // Проверяем: source должен быть в родительских значениях, target — в дочерних
      const parentValue = parentValueMap.get(sourceId);
      if (parentValue && childPropertyIds.includes(targetId)) {
        inheritedValues.set(targetId, parentValue);
      }
    }

    return inheritedValues;
  }

  /**
   * Автоматическое сопоставление по коду свойства (fallback).
   * Если у родителя есть свойство с кодом "material" = "Дуб",
   * и у дочернего есть свойство с таким же кодом "material" —
   * значение наследуется автоматически.
   */
  private async resolveByPropertyCode(
    parentPropertyValues: PropertyValue[],
    childPropertyIds: number[],
  ): Promise<Map<number, string>> {
    const inheritedValues = new Map<number, string>();

    // Загрузим информацию о свойствах для получения кодов
    const parentPropIds = parentPropertyValues
      .filter(pv => pv.value)
      .map(pv => pv.propertyId);

    if (parentPropIds.length === 0 || childPropertyIds.length === 0) {
      return inheritedValues;
    }

    // Получаем свойства по ID
    const parentProperties = await Promise.all(
      parentPropIds.map(id => this.propertyRepository.findById(id)),
    );
    const childProperties = await Promise.all(
      childPropertyIds.map(id => this.propertyRepository.findById(id)),
    );

    // Строим карту: code -> value для родителя
    const parentCodeMap = new Map<string, string>();
    for (let i = 0; i < parentPropIds.length; i++) {
      const prop = parentProperties[i];
      const val = parentPropertyValues.find(pv => pv.propertyId === parentPropIds[i]);
      if (prop && val?.value) {
        parentCodeMap.set(prop.getCode(), val.value);
      }
    }

    // Сопоставляем дочерние свойства с родительскими по коду
    for (let i = 0; i < childPropertyIds.length; i++) {
      const childProp = childProperties[i];
      if (childProp) {
        const parentValue = parentCodeMap.get(childProp.getCode());
        if (parentValue) {
          inheritedValues.set(childPropertyIds[i], parentValue);
        }
      }
    }

    return inheritedValues;
  }

  /**
   * Получить граф зависимостей для визуализации или анализа
   */
  async getDependencyGraph(): Promise<Map<number, PropertyDependency[]>> {
    const allDependencies = await this.dependencyRepository.findAllActive();
    const graph = new Map<number, PropertyDependency[]>();

    for (const dependency of allDependencies) {
      const sourceId = dependency.getSourcePropertyId();
      if (!graph.has(sourceId)) {
        graph.set(sourceId, []);
      }
      graph.get(sourceId)!.push(dependency);
    }

    return graph;
  }

  /**
   * Обнаружить циклические зависимости
   */
  async detectCircularDependencies(): Promise<number[][]> {
    const graph = await this.getDependencyGraph();
    const cycles: number[][] = [];
    const visited = new Set<number>();
    const recursionStack = new Set<number>();

    const dfs = (propertyId: number, path: number[]): void => {
      visited.add(propertyId);
      recursionStack.add(propertyId);
      path.push(propertyId);

      const dependencies = graph.get(propertyId) || [];
      for (const dependency of dependencies) {
        const targetId = dependency.getTargetPropertyId();

        if (!visited.has(targetId)) {
          dfs(targetId, [...path]);
        } else if (recursionStack.has(targetId)) {
          // Найден цикл
          const cycleStart = path.indexOf(targetId);
          cycles.push([...path.slice(cycleStart), targetId]);
        }
      }

      recursionStack.delete(propertyId);
    };

    // Проверяем все узлы
    for (const [propertyId] of graph) {
      if (!visited.has(propertyId)) {
        dfs(propertyId, []);
      }
    }

    return cycles;
  }
}

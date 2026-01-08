/**
 * Типы зависимостей между свойствами
 */
export enum DependencyType {
  REQUIRES = 'requires',        // Если A выбрано, то B обязательно
  EXCLUDES = 'excludes',        // Если A выбрано, то B недоступно
  ENABLES = 'enables',          // Если A выбрано, то B становится доступным
  SETS_VALUE = 'sets_value',    // Если A выбрано, то B получает определенное значение
}

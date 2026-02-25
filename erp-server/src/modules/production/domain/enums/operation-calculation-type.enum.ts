/**
 * Тип расчёта производственной операции
 * @description Определяет единицу измерения для расчёта времени и стоимости операции
 */
export enum OperationCalculationType {
    /** За штуку */
    PER_PIECE = 'PER_PIECE',
    /** За квадратный метр */
    PER_SQM = 'PER_SQM',
    /** За погонный метр */
    PER_LM = 'PER_LM',
    /** За периметр изделия */
    PER_PERIMETER = 'PER_PERIMETER',
    /** Фиксированная стоимость */
    FIXED = 'FIXED',
}

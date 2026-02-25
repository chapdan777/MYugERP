import { Injectable, Logger } from '@nestjs/common';
import * as math from 'mathjs';

@Injectable()
export class FormulaEvaluatorService {
    private readonly logger = new Logger(FormulaEvaluatorService.name);

    /**
     * Вычисляет математическое выражение с заданными переменными контекста
     * @param formula Строка формулы (например, "L * W / 1000")
     * @param context Переменные (ключ-значение) (например, { L: 2000, W: 500 })
     * @returns Вычисленное число
     */
    evaluate(formula: string, context: Record<string, number>): number {
        try {
            // math.evaluate возвращает базовые типы, логику или матрицы. Мы ожидаем здесь числа.
            const result = math.evaluate(formula, context);

            if (typeof result !== 'number') {
                // Обработка случаев, когда результат может быть матрицей или другим типом, если используются сложные формулы
                // Пока что мы предполагаем скалярные результаты
                return Number(result);
            }
            return result;
        } catch (error: any) {
            this.logger.error(`Ошибка вычисления формулы "${formula}" с контекстом ${JSON.stringify(context)}: ${error.message}`);
            // Пробрасываем ошибку, чтобы вызывающий код знал о сбое
            throw new Error(`Ошибка вычисления формулы: ${error.message}`);
        }
    }

    /**
     * Проверяет, является ли формула синтаксически корректной
     */
    validate(formula: string): boolean {
        try {
            math.parse(formula);
            return true;
        } catch (e) {
            return false;
        }
    }
}

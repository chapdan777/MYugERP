import { Module, Global } from '@nestjs/common';
import { FormulaEvaluatorService } from './services/formula-evaluator.service';

@Global()
@Module({
    providers: [FormulaEvaluatorService],
    exports: [FormulaEvaluatorService],
})
export class CommonModule { }

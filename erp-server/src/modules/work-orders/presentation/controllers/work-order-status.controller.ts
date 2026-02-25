import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    Inject,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import {
    IWorkOrderStatusRepository,
    WORK_ORDER_STATUS_REPOSITORY,
} from '../../domain/repositories/work-order-status.repository.interface';
import { WorkOrderStatusEntity } from '../../domain/entities/work-order-status.entity';
import {
    CreateWorkOrderStatusDto,
    UpdateWorkOrderStatusDto,
    WorkOrderStatusResponseDto,
} from '../dtos/work-order-status.dto';

/**
 * Контроллер управления статусами заказ-нарядов
 */
@Controller('work-order-statuses')
export class WorkOrderStatusController {
    constructor(
        @Inject(WORK_ORDER_STATUS_REPOSITORY)
        private readonly statusRepository: IWorkOrderStatusRepository,
    ) { }

    /**
     * Создать новый статус
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateWorkOrderStatusDto): Promise<WorkOrderStatusResponseDto> {
        // Проверка уникальности кода
        const existing = await this.statusRepository.findByCode(dto.code);
        if (existing) {
            throw new ConflictException(`Статус с кодом '${dto.code}' уже существует`);
        }

        const status = WorkOrderStatusEntity.create({
            code: dto.code,
            name: dto.name,
            color: dto.color || '#808080',
            sortOrder: dto.sortOrder,
            isInitial: dto.isInitial,
            isFinal: dto.isFinal,
            isActive: dto.isActive,
        });

        const saved = await this.statusRepository.save(status);
        return WorkOrderStatusResponseDto.fromEntity(saved);
    }

    /**
     * Получить все статусы
     */
    @Get()
    async findAll(): Promise<WorkOrderStatusResponseDto[]> {
        const statuses = await this.statusRepository.findAll();
        return statuses.map(s => WorkOrderStatusResponseDto.fromEntity(s));
    }

    /**
     * Получить статус по ID
     */
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<WorkOrderStatusResponseDto> {
        const status = await this.statusRepository.findById(id);
        if (!status) {
            throw new NotFoundException(`Статус с ID ${id} не найден`);
        }
        return WorkOrderStatusResponseDto.fromEntity(status);
    }

    /**
     * Обновить статус
     */
    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateWorkOrderStatusDto,
    ): Promise<WorkOrderStatusResponseDto> {
        const status = await this.statusRepository.findById(id);
        if (!status) {
            throw new NotFoundException(`Статус с ID ${id} не найден`);
        }

        status.updateInfo({
            name: dto.name,
            color: dto.color,
            sortOrder: dto.sortOrder,
            isInitial: dto.isInitial,
            isFinal: dto.isFinal,
            isActive: dto.isActive,
        });

        const saved = await this.statusRepository.save(status);
        return WorkOrderStatusResponseDto.fromEntity(saved);
    }

    /**
     * Удалить статус
     */
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        const status = await this.statusRepository.findById(id);
        if (!status) {
            throw new NotFoundException(`Статус с ID ${id} не найден`);
        }
        await this.statusRepository.delete(id);
    }
}

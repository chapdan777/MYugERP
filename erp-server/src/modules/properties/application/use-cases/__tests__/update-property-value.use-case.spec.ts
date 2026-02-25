import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdatePropertyValueUseCase } from '../update-property-value.use-case';
import { PROPERTY_VALUE_REPOSITORY } from '../../../domain/repositories/injection-tokens';
import { PropertyValue } from '../../../domain/entities/property-value.entity';

describe('UpdatePropertyValueUseCase', () => {
    let useCase: UpdatePropertyValueUseCase;
    let repositoryMock: any;

    beforeEach(async () => {
        repositoryMock = {
            findById: jest.fn(),
            save: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdatePropertyValueUseCase,
                {
                    provide: PROPERTY_VALUE_REPOSITORY,
                    useValue: repositoryMock,
                },
            ],
        }).compile();

        useCase = module.get<UpdatePropertyValueUseCase>(UpdatePropertyValueUseCase);
    });

    it('should define use case', () => {
        expect(useCase).toBeDefined();
    });

    it('should throw NotFoundException if property value not found', async () => {
        repositoryMock.findById.mockResolvedValue(null);

        await expect(useCase.execute(1, {})).rejects.toThrow(NotFoundException);
        expect(repositoryMock.findById).toHaveBeenCalledWith(1);
    });

    it('should update property value and save it', async () => {
        const existingValue = PropertyValue.restore({
            id: 1,
            propertyId: 10,
            value: 'Old',
            priceModifierId: null,
            displayOrder: 0,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        repositoryMock.findById.mockResolvedValue(existingValue);
        repositoryMock.save.mockImplementation((val) => Promise.resolve(val));

        const dto = {
            value: 'New',
            priceModifierId: 123,
            displayOrder: 5,
        };

        const result = await useCase.execute(1, dto);

        expect(result.getValue()).toBe('New');
        expect(result.getPriceModifierId()).toBe(123);
        expect(result.getDisplayOrder()).toBe(5);
        expect(repositoryMock.save).toHaveBeenCalled();
    });
});

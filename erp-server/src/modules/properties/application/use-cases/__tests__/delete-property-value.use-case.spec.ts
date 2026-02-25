import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeletePropertyValueUseCase } from '../delete-property-value.use-case';
import { PROPERTY_VALUE_REPOSITORY } from '../../../domain/repositories/injection-tokens';

describe('DeletePropertyValueUseCase', () => {
    let useCase: DeletePropertyValueUseCase;
    let repositoryMock: any;

    beforeEach(async () => {
        repositoryMock = {
            findById: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeletePropertyValueUseCase,
                {
                    provide: PROPERTY_VALUE_REPOSITORY,
                    useValue: repositoryMock,
                },
            ],
        }).compile();

        useCase = module.get<DeletePropertyValueUseCase>(DeletePropertyValueUseCase);
    });

    it('should define use case', () => {
        expect(useCase).toBeDefined();
    });

    it('should throw NotFoundException if property value not found', async () => {
        repositoryMock.findById.mockResolvedValue(null);

        await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
    });

    it('should call delete on repository', async () => {
        repositoryMock.findById.mockResolvedValue({ id: 1 });
        repositoryMock.delete.mockResolvedValue(undefined);

        await useCase.execute(1);

        expect(repositoryMock.delete).toHaveBeenCalledWith(1);
    });
});

import { DomainException } from '../../../../common/exceptions/domain.exception';
import { PropertyHeader } from '../entities/property-header.entity';
import { PropertyHeaderItem } from '../entities/property-header-item.entity';
import { IPropertyHeaderRepository } from '../repositories/property-header.repository.interface';
import { IPropertyHeaderItemRepository } from '../repositories/property-header-item.repository.interface';
import { IPropertyHeaderProductRepository } from '../repositories/property-header-product.repository.interface';
import { PropertyHeaderProduct } from '../entities/property-header-product.entity';

/**
 * PropertyHeaderService - Сервис для бизнес-логики работы с шапками свойств
 */
export class PropertyHeaderService {
  constructor(
    private readonly propertyHeaderRepository: IPropertyHeaderRepository,
    private readonly propertyHeaderItemRepository: IPropertyHeaderItemRepository,
    private readonly propertyHeaderProductRepository: IPropertyHeaderProductRepository,
  ) { }

  /**
   * Получение всех шапок с фильтрацией
   */
  async findAll(filters?: {
    isActive?: boolean;
    orderTypeId?: number;
  }): Promise<PropertyHeader[]> {
    return await this.propertyHeaderRepository.findAll(filters);
  }

  /**
   * Получение шапки по ID
   */
  async findById(id: number): Promise<PropertyHeader | null> {
    return await this.propertyHeaderRepository.findById(id);
  }

  /**
   * Создание новой шапки свойств
   */
  async createHeader(props: {
    name: string;
    orderTypeId: number;
    description?: string | null;
  }): Promise<PropertyHeader> {
    // Проверка уникальности имени
    const exists = await this.propertyHeaderRepository.existsByName(props.name);
    if (exists) {
      throw new DomainException(`Шапка с названием "${props.name}" уже существует`);
    }

    const header = PropertyHeader.create(props);
    return await this.propertyHeaderRepository.save(header);
  }

  /**
   * Обновление шапки свойств
   */
  async updateHeader(id: number, props: {
    name?: string;
    description?: string | null;
  }): Promise<PropertyHeader> {
    const header = await this.propertyHeaderRepository.findById(id);
    if (!header) {
      throw new DomainException(`Шапка с ID ${id} не найдена`);
    }

    // Если имя меняется, проверяем уникальность
    if (props.name && props.name !== header.getName()) {
      const exists = await this.propertyHeaderRepository.existsByName(props.name, id);
      if (exists) {
        throw new DomainException(`Шапка с названием "${props.name}" уже существует`);
      }
    }

    header.updateInfo(props);
    return await this.propertyHeaderRepository.save(header);
  }

  /**
   * Активация шапки
   */
  async activateHeader(id: number): Promise<PropertyHeader> {
    const header = await this.propertyHeaderRepository.findById(id);
    if (!header) {
      throw new DomainException(`Шапка с ID ${id} не найдена`);
    }

    header.activate();
    return await this.propertyHeaderRepository.save(header);
  }

  /**
   * Деактивация шапки
   */
  async deactivateHeader(id: number): Promise<PropertyHeader> {
    const header = await this.propertyHeaderRepository.findById(id);
    if (!header) {
      throw new DomainException(`Шапка с ID ${id} не найдена`);
    }

    header.deactivate();
    return await this.propertyHeaderRepository.save(header);
  }

  /**
   * Добавление элемента в шапку (только связь со свойством)
   */
  async addItemToHeader(props: {
    headerId: number;
    propertyId: number;
    sortOrder?: number;
  }): Promise<PropertyHeaderItem> {
    // Проверка существования шапки
    const header = await this.propertyHeaderRepository.findById(props.headerId);
    if (!header) {
      throw new DomainException(`Шапка с ID ${props.headerId} не найдена`);
    }

    // Проверка, что элемент еще не существует
    const existingItem = await this.propertyHeaderItemRepository.findByHeaderIdAndPropertyId(
      props.headerId,
      props.propertyId,
    );
    if (existingItem) {
      throw new DomainException(`Свойство с ID ${props.propertyId} уже добавлено в эту шапку`);
    }

    const item = PropertyHeaderItem.create({
      headerId: props.headerId,
      propertyId: props.propertyId,
      sortOrder: props.sortOrder,
    });

    // Если указан порядок, устанавливаем его
    if (props.sortOrder !== undefined) {
      item.setSortOrder(props.sortOrder);
    } else {
      // Иначе устанавливаем автоматический порядок
      const existingItems = await this.propertyHeaderItemRepository.findByHeaderId(props.headerId);
      const maxOrder = existingItems.length > 0
        ? Math.max(...existingItems.map(i => i.getSortOrder()))
        : 0;
      item.setSortOrder(maxOrder + 1);
    }

    return await this.propertyHeaderItemRepository.save(item);
  }



  /**
   * Удаление элемента из шапки
   */
  async removeItemFromHeader(headerId: number, propertyId: number): Promise<void> {
    const item = await this.propertyHeaderItemRepository.findByHeaderIdAndPropertyId(headerId, propertyId);
    if (!item) {
      throw new DomainException(`Элемент шапки для свойства ${propertyId} не найден`);
    }

    await this.propertyHeaderItemRepository.deleteByHeaderIdAndPropertyId(headerId, propertyId);
  }

  /**
   * Получение всех элементов шапки
   */
  async getHeaderItems(headerId: number): Promise<PropertyHeaderItem[]> {
    const header = await this.propertyHeaderRepository.findById(headerId);
    if (!header) {
      throw new DomainException(`Шапка с ID ${headerId} не найдена`);
    }

    return await this.propertyHeaderItemRepository.findByHeaderId(headerId);
  }

  /**
   * Удаление шапки со всеми элементами
   */
  async deleteHeader(id: number): Promise<void> {
    const header = await this.propertyHeaderRepository.findById(id);
    if (!header) {
      throw new DomainException(`Шапка с ID ${id} не найдена`);
    }

    // Удаляем все элементы шапки
    await this.propertyHeaderItemRepository.deleteByHeaderId(id);

    // Удаляем саму шапку
    await this.propertyHeaderRepository.delete(id);
  }
  /**
   * Добавление продукта в шапку
   */
  async addProductToHeader(headerId: number, productId: number): Promise<PropertyHeaderProduct> {
    const header = await this.propertyHeaderRepository.findById(headerId);
    if (!header) {
      throw new DomainException(`Шапка с ID ${headerId} не найдена`);
    }

    const exists = await this.propertyHeaderProductRepository.exists(headerId, productId);
    if (exists) {
      throw new DomainException(`Продукт с ID ${productId} уже добавлен в эту шапку`);
    }

    const item = PropertyHeaderProduct.create({ headerId, productId });
    return await this.propertyHeaderProductRepository.save(item);
  }

  /**
   * Удаление продукта из шапки
   */
  async removeProductFromHeader(headerId: number, productId: number): Promise<void> {
    const header = await this.propertyHeaderRepository.findById(headerId);
    if (!header) {
      throw new DomainException(`Шапка с ID ${headerId} не найдена`);
    }

    await this.propertyHeaderProductRepository.deleteByHeaderIdAndProductId(headerId, productId);
  }

  /**
   * Получение продуктов шапки
   */
  async getHeaderProducts(headerId: number): Promise<PropertyHeaderProduct[]> {
    return await this.propertyHeaderProductRepository.findByHeaderId(headerId);
  }
}
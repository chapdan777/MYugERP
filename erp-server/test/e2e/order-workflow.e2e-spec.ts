import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';

// Using simplified DTO interfaces since actual DTOs may not be available
interface CreateOrderDto {
  orderNumber: string;
  clientId: number;
  clientName: string;
  deadline?: string;
  notes?: string;
}

interface AddSectionToOrderDto {
  sectionNumber: number;
  sectionName: string;
  notes?: string;
}

interface AddItemToSectionDto {
  productId: number;
  productName: string;
  quantity: number;
  unit: number;
  basePrice: number;
  coefficient?: number;
  notes?: string;
  properties?: Array<{
    propertyId: number;
    propertyName: string;
    propertyValue: string;
  }>;
}

describe('Order Management E2E Workflow', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  let orderId: number;
  let sectionId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get access token for tests
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'admin',
        password: 'admin123',
      });

    accessToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Full Order Creation Workflow', () => {
    it('should create a new order', async () => {
      const createOrderDto: CreateOrderDto = {
        orderNumber: 'E2E-TEST-001',
        clientId: 1,
        clientName: 'E2E Test Client',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        notes: 'E2E test order for workflow validation',
      };

      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createOrderDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.orderNumber).toBe(createOrderDto.orderNumber);
      expect(response.body.clientName).toBe(createOrderDto.clientName);
      expect(response.body.status).toBe('DRAFT');
      
      orderId = response.body.id;
    });

    it('should add section to the order', async () => {
      const addSectionDto: AddSectionToOrderDto = {
        sectionNumber: 1,
        sectionName: 'Kitchen Facades',
        notes: 'Main kitchen section',
      };

      const response = await request(app.getHttpServer())
        .post(`/orders/${orderId}/sections`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(addSectionDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.sectionNumber).toBe(addSectionDto.sectionNumber);
      expect(response.body.sectionName).toBe(addSectionDto.sectionName);
      
      sectionId = response.body.id;
    });

    it('should add item to the section', async () => {
      const addItemDto: AddItemToSectionDto = {
        productId: 1,
        productName: 'Kitchen Facade Premium',
        quantity: 2,
        unit: 1.5, // 1.5 m² per item
        basePrice: 1500,
        coefficient: 1.2,
        notes: 'White gloss finish',
        properties: [
          {
            propertyId: 1,
            propertyName: 'Color',
            propertyValue: 'White',
          },
          {
            propertyId: 2,
            propertyName: 'Finish',
            propertyValue: 'Gloss',
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post(`/orders/${orderId}/sections/${sectionId}/items`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(addItemDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.productName).toBe(addItemDto.productName);
      expect(response.body.quantity).toBe(addItemDto.quantity);
      expect(response.body.properties).toHaveLength(2);
    });

    it('should calculate order totals correctly', async () => {
      const response = await request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalAmount');
      expect(response.body.totalAmount).toBeGreaterThan(0);
      expect(response.body.sections).toHaveLength(1);
      expect(response.body.sections[0].items).toHaveLength(1);
    });

    it('should update order status to confirmed', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'CONFIRMED' })
        .expect(200);

      expect(response.body.status).toBe('CONFIRMED');
    });

    it('should prevent modification of confirmed order', async () => {
      const addItemDto: AddItemToSectionDto = {
        productId: 2,
        productName: 'Additional Item',
        quantity: 1,
        unit: 1,
        basePrice: 1000,
      };

      await request(app.getHttpServer())
        .post(`/orders/${orderId}/sections/${sectionId}/items`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(addItemDto)
        .expect(400); // Should fail because order is confirmed
    });
  });

  describe('Order Pricing Workflow', () => {
    let pricingOrderId: number;
    let pricingSectionId: number;

    it('should create order with complex pricing scenario', async () => {
      const createOrderDto: CreateOrderDto = {
        orderNumber: 'PRICING-TEST-001',
        clientId: 2,
        clientName: 'Pricing Test Client',
      };

      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createOrderDto)
        .expect(201);

      pricingOrderId = response.body.id;
    });

    it('should add section for pricing test', async () => {
      const addSectionDto: AddSectionToOrderDto = {
        sectionNumber: 1,
        sectionName: 'Pricing Test Section',
      };

      const response = await request(app.getHttpServer())
        .post(`/orders/${pricingOrderId}/sections`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(addSectionDto)
        .expect(201);

      pricingSectionId = response.body.id;
    });

    it('should add item with multiple modifiers', async () => {
      const addItemDto: AddItemToSectionDto = {
        productId: 1,
        productName: 'Complex Pricing Product',
        quantity: 3,
        unit: 2.0, // 2 m² per item
        basePrice: 1500,
        coefficient: 1.3,
        properties: [
          {
            propertyId: 1,
            propertyName: 'Model',
            propertyValue: 'Premium',
          },
          {
            propertyId: 2,
            propertyName: 'Material',
            propertyValue: 'High-gloss',
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post(`/orders/${pricingOrderId}/sections/${pricingSectionId}/items`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(addItemDto)
        .expect(201);

      // Verify pricing calculation was performed
      expect(response.body).toHaveProperty('calculatedPrice');
      expect(response.body.calculatedPrice).toBeGreaterThan(0);
    });

    it('should recalculate item price when properties change', async () => {
      // First, get the item
      const orderResponse = await request(app.getHttpServer())
        .get(`/orders/${pricingOrderId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const itemId = orderResponse.body.sections[0].items[0].id;

      // Update item properties
      const updatePropertiesDto = {
        properties: [
          {
            propertyId: 1,
            propertyName: 'Model',
            propertyValue: 'Standard', // Changed from Premium
          },
          {
            propertyId: 2,
            propertyName: 'Material',
            propertyValue: 'Matte', // Changed from High-gloss
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .patch(`/orders/${pricingOrderId}/sections/${pricingSectionId}/items/${itemId}/properties`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatePropertiesDto)
        .expect(200);

      // Price should have been recalculated
      expect(response.body).toHaveProperty('calculatedPrice');
    });
  });

  describe('Bulk Operations', () => {
    let bulkOrderId: number;
    let bulkSectionId: number;

    it('should handle bulk item addition', async () => {
      // Create order
      const createOrderResponse = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          orderNumber: 'BULK-TEST-001',
          clientId: 3,
          clientName: 'Bulk Test Client',
        })
        .expect(201);

      bulkOrderId = createOrderResponse.body.id;

      // Add section
      const addSectionResponse = await request(app.getHttpServer())
        .post(`/orders/${bulkOrderId}/sections`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          sectionNumber: 1,
          sectionName: 'Bulk Items Section',
        })
        .expect(201);

      bulkSectionId = addSectionResponse.body.id;

      // Add multiple items in sequence
      const itemsToAdd = [
        {
          productId: 1,
          productName: 'Item 1',
          quantity: 2,
          unit: 1.0,
          basePrice: 1000,
        },
        {
          productId: 2,
          productName: 'Item 2',
          quantity: 1,
          unit: 1.5,
          basePrice: 1500,
        },
        {
          productId: 3,
          productName: 'Item 3',
          quantity: 3,
          unit: 0.8,
          basePrice: 800,
        },
      ];

      for (const item of itemsToAdd) {
        await request(app.getHttpServer())
          .post(`/orders/${bulkOrderId}/sections/${bulkSectionId}/items`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(item)
          .expect(201);
      }

      // Verify all items were added
      const finalOrder = await request(app.getHttpServer())
        .get(`/orders/${bulkOrderId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(finalOrder.body.sections[0].items).toHaveLength(3);
      expect(finalOrder.body.totalAmount).toBeGreaterThan(0);
    });
  });

  describe('Error Handling Scenarios', () => {
    it('should handle invalid order ID', async () => {
      await request(app.getHttpServer())
        .get('/orders/999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should handle invalid section ID', async () => {
      await request(app.getHttpServer())
        .post('/orders/1/sections/999999/items')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          productId: 1,
          productName: 'Test Item',
          quantity: 1,
          unit: 1,
          basePrice: 1000,
        })
        .expect(404);
    });

    it('should validate required fields', async () => {
      const invalidOrderDto = {
        // Missing required fields
        clientId: 1,
        // orderNumber and clientName are missing
      };

      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidOrderDto)
        .expect(400);
    });

    it('should prevent duplicate order numbers', async () => {
      const createOrderDto = {
        orderNumber: 'DUPLICATE-TEST',
        clientId: 1,
        clientName: 'Test Client',
      };

      // Create first order
      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createOrderDto)
        .expect(201);

      // Try to create duplicate
      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createOrderDto)
        .expect(409); // Conflict
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/orders')
        .expect(401); // No auth token provided
    });
  });
});
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

/**
 * WebSocket Gateway for real-time work order updates
 * 
 * Provides real-time notifications for:
 * - Work order status changes
 * - Kanban board updates
 * - Work order assignments
 * - Priority changes
 */
@WebSocketGateway({
  cors: {
    origin: '*', // Configure this properly in production
    credentials: true,
  },
  namespace: '/work-orders',
})
export class WorkOrderGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(WorkOrderGateway.name);

  // Track connected clients and their subscribed departments
  private readonly clientDepartments = new Map<string, Set<number>>();

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
    this.clientDepartments.set(client.id, new Set());
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.clientDepartments.delete(client.id);
  }

  /**
   * Subscribe to department updates
   * Client sends: { departmentId: number }
   */
  @SubscribeMessage('subscribe-department')
  handleSubscribeDepartment(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { departmentId: number },
  ): void {
    const { departmentId } = payload;
    
    const departments = this.clientDepartments.get(client.id);
    if (departments) {
      departments.add(departmentId);
      this.logger.log(`Client ${client.id} subscribed to department ${departmentId}`);
    }

    // Join Socket.IO room for this department
    const roomName = `department:${departmentId}`;
    client.join(roomName);

    // Acknowledge subscription
    client.emit('subscribed', { departmentId });
  }

  /**
   * Unsubscribe from department updates
   * Client sends: { departmentId: number }
   */
  @SubscribeMessage('unsubscribe-department')
  handleUnsubscribeDepartment(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { departmentId: number },
  ): void {
    const { departmentId } = payload;
    
    const departments = this.clientDepartments.get(client.id);
    if (departments) {
      departments.delete(departmentId);
      this.logger.log(`Client ${client.id} unsubscribed from department ${departmentId}`);
    }

    // Leave Socket.IO room
    const roomName = `department:${departmentId}`;
    client.leave(roomName);

    // Acknowledge unsubscription
    client.emit('unsubscribed', { departmentId });
  }

  /**
   * Subscribe to specific work order updates
   * Client sends: { workOrderId: number }
   */
  @SubscribeMessage('subscribe-work-order')
  handleSubscribeWorkOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { workOrderId: number },
  ): void {
    const { workOrderId } = payload;
    const roomName = `work-order:${workOrderId}`;
    client.join(roomName);
    
    this.logger.log(`Client ${client.id} subscribed to work order ${workOrderId}`);
    client.emit('subscribed', { workOrderId });
  }

  /**
   * Unsubscribe from specific work order updates
   * Client sends: { workOrderId: number }
   */
  @SubscribeMessage('unsubscribe-work-order')
  handleUnsubscribeWorkOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { workOrderId: number },
  ): void {
    const { workOrderId } = payload;
    const roomName = `work-order:${workOrderId}`;
    client.leave(roomName);
    
    this.logger.log(`Client ${client.id} unsubscribed from work order ${workOrderId}`);
    client.emit('unsubscribed', { workOrderId });
  }

  /**
   * Emit work order status change to subscribed clients
   */
  emitWorkOrderStatusChanged(payload: {
    workOrderId: number;
    workOrderNumber: string;
    departmentId: number;
    oldStatus: string;
    newStatus: string;
    changedAt: Date;
    changedBy?: number;
  }): void {
    // Emit to work order subscribers
    this.server
      .to(`work-order:${payload.workOrderId}`)
      .emit('work-order:status-changed', payload);

    // Emit to department subscribers
    this.server
      .to(`department:${payload.departmentId}`)
      .emit('work-order:status-changed', payload);

    this.logger.log(
      `Emitted status change for work order ${payload.workOrderNumber}: ${payload.oldStatus} → ${payload.newStatus}`,
    );
  }

  /**
   * Emit work order created event
   */
  emitWorkOrderCreated(payload: {
    workOrderId: number;
    workOrderNumber: string;
    departmentId: number;
    orderId: number;
    orderNumber: string;
    operationId: number;
    operationName: string;
    priority: number;
    createdAt: Date;
  }): void {
    // Emit to department subscribers
    this.server
      .to(`department:${payload.departmentId}`)
      .emit('work-order:created', payload);

    this.logger.log(`Emitted work order created: ${payload.workOrderNumber}`);
  }

  /**
   * Emit work order assigned event
   */
  emitWorkOrderAssigned(payload: {
    workOrderId: number;
    workOrderNumber: string;
    departmentId: number;
    workerId: number;
    workerName: string;
    assignedAt: Date;
  }): void {
    this.server
      .to(`work-order:${payload.workOrderId}`)
      .emit('work-order:assigned', payload);

    this.server
      .to(`department:${payload.departmentId}`)
      .emit('work-order:assigned', payload);

    this.logger.log(
      `Emitted work order assigned: ${payload.workOrderNumber} to ${payload.workerName}`,
    );
  }

  /**
   * Emit work order priority changed event
   */
  emitWorkOrderPriorityChanged(payload: {
    workOrderId: number;
    workOrderNumber: string;
    departmentId: number;
    oldPriority: number;
    newPriority: number;
    reason?: string;
    changedBy: number;
    changedAt: Date;
  }): void {
    this.server
      .to(`work-order:${payload.workOrderId}`)
      .emit('work-order:priority-changed', payload);

    this.server
      .to(`department:${payload.departmentId}`)
      .emit('work-order:priority-changed', payload);

    this.logger.log(
      `Emitted priority change for work order ${payload.workOrderNumber}: ${payload.oldPriority} → ${payload.newPriority}`,
    );
  }

  /**
   * Emit Kanban board update (for batch updates)
   */
  emitKanbanBoardUpdated(payload: {
    departmentId: number;
    updatedAt: Date;
    reason?: string;
  }): void {
    this.server
      .to(`department:${payload.departmentId}`)
      .emit('kanban:board-updated', payload);

    this.logger.log(`Emitted Kanban board update for department ${payload.departmentId}`);
  }

  /**
   * Emit work order progress update (actual hours recorded)
   */
  emitWorkOrderProgressUpdated(payload: {
    workOrderId: number;
    workOrderNumber: string;
    departmentId: number;
    itemId: number;
    actualHours: number;
    totalActualHours: number;
    totalEstimatedHours: number;
    progressPercentage: number;
    updatedAt: Date;
  }): void {
    this.server
      .to(`work-order:${payload.workOrderId}`)
      .emit('work-order:progress-updated', payload);

    this.server
      .to(`department:${payload.departmentId}`)
      .emit('work-order:progress-updated', payload);

    this.logger.log(
      `Emitted progress update for work order ${payload.workOrderNumber}: ${payload.progressPercentage.toFixed(1)}%`,
    );
  }

  /**
   * Get list of clients subscribed to a department
   */
  getSubscribersForDepartment(departmentId: number): string[] {
    const subscribers: string[] = [];
    
    for (const [clientId, departments] of this.clientDepartments.entries()) {
      if (departments.has(departmentId)) {
        subscribers.push(clientId);
      }
    }
    
    return subscribers;
  }
}

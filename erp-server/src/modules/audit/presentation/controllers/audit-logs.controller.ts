import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogsController {

  // This is a mock implementation. In a real application, you would fetch this from a service.
  // This is a mock implementation. In a real application, you would fetch this from a service.
  private auditLogs: any[] = [{
    id: 'log-1',
    action: 'CREATE',
    entityType: 'product'
  }];

  @Get()
  findAll() {
    return this.auditLogs;
  }
}

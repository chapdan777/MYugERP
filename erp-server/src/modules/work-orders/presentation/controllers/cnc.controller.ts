import { Controller, Get, Param, ParseIntPipe, Res, Header } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CncDataService } from '../../domain/services/cnc-data.service';

@ApiTags('WorkOrders CNC')
@Controller('work-orders/cnc')
export class CncController {
    constructor(
        private readonly cncDataService: CncDataService,
    ) { }

    @Get(':workOrderId')
    @ApiOperation({ summary: 'Download CNC data for Work Order' })
    @ApiResponse({ status: 200, description: 'JSON file with CNC data' })
    @Header('Content-Type', 'application/json')
    @Header('Content-Disposition', 'attachment; filename="cnc-data.json"')
    async downloadCncData(
        @Param('workOrderId', ParseIntPipe) workOrderId: number,
        @Res() res: Response
    ) {
        const data = await this.cncDataService.generateCncData(workOrderId);

        const filename = `cnc_wo_${data.workOrderNumber}.json`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        res.send(data);
    }
}

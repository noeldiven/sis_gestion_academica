
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FinanceService } from './finance.service.js';

interface MockPayWebhookPayload {
  event: 'payment.succeeded' | 'payment.failed';
  id: string;
  amount: number;
  currency: string;
  status: 'SUCCEEDED' | 'FAILED';
  failure_reason?: string | null;
  metadata: {
    order_id: string;
  };
}

@ApiTags('MockPay Webhook')
@Controller('finance/mockpay')
export class MockPayWebhookController {
  constructor(
    private readonly financeService: FinanceService,
  ) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Recibir notificaciones de MockPay',
    description:
      'Verifica la transacción y actualiza el pago correspondiente en SGAF.',
  })
  async receiveWebhook(@Body() body: MockPayWebhookPayload) {
    if (
      !body ||
      typeof body.id !== 'string' ||
      !body.id ||
      !body.metadata ||
      typeof body.metadata.order_id !== 'string' ||
      !['payment.succeeded', 'payment.failed'].includes(
        body.event,
      )
    ) {
      throw new BadRequestException(
        'Notificación de MockPay inválida',
      );
    }

    return this.financeService.processMockPayWebhook(body);
  }
}

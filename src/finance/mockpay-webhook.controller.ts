import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
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
  created_at?: string;
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
  @ApiBody({
    description: 'Notificación enviada por MockPay al cambiar el estado de una transacción.',
    required: true,
    schema: {
      type: 'object',
      required: [
        'event',
        'id',
        'amount',
        'currency',
        'status',
        'metadata',
      ],
      properties: {
        event: {
          type: 'string',
          enum: ['payment.succeeded', 'payment.failed'],
          example: 'payment.succeeded',
        },
        id: {
          type: 'string',
          example: '50597321-e36f-452b-92cb-e5081d5e63a2',
        },
        amount: {
          type: 'number',
          example: 150,
        },
        currency: {
          type: 'string',
          example: 'USD',
        },
        status: {
          type: 'string',
          enum: ['SUCCEEDED', 'FAILED'],
          example: 'SUCCEEDED',
        },
        failure_reason: {
          type: 'string',
          nullable: true,
          example: null,
        },
        metadata: {
          type: 'object',
          required: ['order_id'],
          properties: {
            order_id: {
              type: 'string',
              example: '5',
            },
          },
        },
        created_at: {
          type: 'string',
          example: '2026-10-09T16:00:00.000Z',
        },
      },
    },
  })
  async receiveWebhook(
    @Body() body: MockPayWebhookPayload,
  ) {
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

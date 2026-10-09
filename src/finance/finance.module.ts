import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller.js';
import { MockPayWebhookController } from './mockpay-webhook.controller.js';
import { FinanceService } from './finance.service.js';

@Module({
  controllers: [
    FinanceController,
    MockPayWebhookController,
  ],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}

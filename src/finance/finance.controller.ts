import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { FinanceService } from './finance.service.js';
import { CreateFinancialObligationDto } from './dto/create-financial-obligation.dto.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';

@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinanceController {
  constructor(
    private readonly financeService: FinanceService,
  ) {}

  @Get('obligations')
  @Roles('ADMIN', 'RECEPCIONISTA')
  findAllObligations() {
    return this.financeService.findAllObligations();
  }

  @Get('obligations/:id')
  @Roles('ADMIN', 'RECEPCIONISTA')
  findObligation(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.financeService.findObligation(id);
  }

  @Post('obligations')
  @Roles('ADMIN', 'RECEPCIONISTA')
  createObligation(
    @Body() dto: CreateFinancialObligationDto,
  ) {
    return this.financeService.createObligation(dto);
  }

  @Get('payments')
  @Roles('ADMIN', 'RECEPCIONISTA')
  findAllPayments() {
    return this.financeService.findAllPayments();
  }

  @Post('payments')
  @Roles('ESTUDIANTE', 'ADMIN', 'RECEPCIONISTA')
  createPayment(
    @Body() dto: CreatePaymentDto,
  ) {
    return this.financeService.createPayment(dto);
  }

  @Patch('payments/:id/approve')
  @Roles('ADMIN', 'RECEPCIONISTA')
  approvePayment(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.financeService.approvePayment(
      id,
      req.user.id,
    );
  }

  @Patch('payments/:id/reject')
  @Roles('ADMIN', 'RECEPCIONISTA')
  rejectPayment(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.financeService.rejectPayment(
      id,
      req.user.id,
    );
  }

  @Post('process-overdue')
  @Roles('ADMIN', 'RECEPCIONISTA')
  processOverdue() {
    return this.financeService.processOverdueObligations();
  }

  @Get('student/:studentId/status')
  @Roles('ADMIN', 'RECEPCIONISTA')
  studentFinancialStatus(
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.financeService.checkStudentFinancialStatus(
      studentId,
    );
  }
}
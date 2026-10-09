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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { FinanceService } from './finance.service.js';
import { CreateFinancialObligationDto } from './dto/create-financial-obligation.dto.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { CreateGatewayCheckoutDto } from './dto/create-gateway-checkout.dto.js';

@ApiTags('Finance')
@ApiBearerAuth('access-token')
@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinanceController {
  constructor(
    private readonly financeService: FinanceService,
  ) {}

  @Get('obligations')
  @Roles('ADMIN', 'RECEPCIONISTA')
  @ApiOperation({
    summary: 'Listar obligaciones financieras',
    description:
      'Obtiene todas las obligaciones financieras registradas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de obligaciones obtenida correctamente.',
  })
  @ApiResponse({
    status: 403,
    description: 'El usuario no tiene permisos suficientes.',
  })
  findAllObligations() {
    return this.financeService.findAllObligations();
  }

  @Get('obligations/:id')
  @Roles('ADMIN', 'RECEPCIONISTA')
  @ApiOperation({
    summary: 'Obtener una obligación financiera',
    description:
      'Obtiene el detalle de una obligación financiera mediante su ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Obligación encontrada correctamente.',
  })
  @ApiResponse({
    status: 403,
    description: 'El usuario no tiene permisos suficientes.',
  })
  @ApiResponse({
    status: 404,
    description: 'Obligación financiera no encontrada.',
  })
  findObligation(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.financeService.findObligation(id);
  }

  @Post('obligations')
  @Roles('ADMIN', 'RECEPCIONISTA')
  @ApiOperation({
    summary: 'Crear obligación financiera',
    description:
      'Registra una nueva obligación financiera asociada a un estudiante y período académico.',
  })
  @ApiResponse({
    status: 201,
    description: 'Obligación financiera creada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Los datos enviados no son válidos.',
  })
  @ApiResponse({
    status: 403,
    description: 'El usuario no tiene permisos suficientes.',
  })
  createObligation(
    @Body() dto: CreateFinancialObligationDto,
  ) {
    return this.financeService.createObligation(dto);
  }

  @Get('payments')
  @Roles('ADMIN', 'RECEPCIONISTA')
  @ApiOperation({
    summary: 'Listar pagos',
    description:
      'Obtiene todos los pagos registrados en el sistema.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de pagos obtenida correctamente.',
  })
  @ApiResponse({
    status: 403,
    description: 'El usuario no tiene permisos suficientes.',
  })
  findAllPayments() {
    return this.financeService.findAllPayments();
  }

  @Post('payments')
  @Roles('ESTUDIANTE', 'ADMIN', 'RECEPCIONISTA')
  @ApiOperation({
    summary: 'Registrar un pago',
    description:
      'Registra un pago asociado a una obligación financiera.',
  })
  @ApiResponse({
    status: 201,
    description: 'Pago registrado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Los datos enviados no son válidos.',
  })
  @ApiResponse({
    status: 403,
    description: 'El usuario no tiene permisos suficientes.',
  })
  createPayment(
    @Body() dto: CreatePaymentDto,
  ) {
    return this.financeService.createPayment(dto);
  }

  @Patch('payments/:id/approve')
  @Roles('ADMIN', 'RECEPCIONISTA')
  @ApiOperation({
    summary: 'Aprobar un pago',
    description:
      'Aprueba un pago pendiente y registra al usuario que realizó la aprobación.',
  })
  @ApiResponse({
    status: 200,
    description: 'Pago aprobado correctamente.',
  })
  @ApiResponse({
    status: 403,
    description: 'El usuario no tiene permisos suficientes.',
  })
  @ApiResponse({
    status: 404,
    description: 'Pago no encontrado.',
  })
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
  @ApiOperation({
    summary: 'Rechazar un pago',
    description:
      'Rechaza un pago pendiente y registra al usuario que realizó el rechazo.',
  })
  @ApiResponse({
    status: 200,
    description: 'Pago rechazado correctamente.',
  })
  @ApiResponse({
    status: 403,
    description: 'El usuario no tiene permisos suficientes.',
  })
  @ApiResponse({
    status: 404,
    description: 'Pago no encontrado.',
  })
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
  @ApiOperation({
    summary: 'Procesar obligaciones vencidas',
    description:
      'Procesa las obligaciones financieras cuya fecha límite de pago ya venció.',
  })
  @ApiResponse({
    status: 201,
    description: 'Obligaciones vencidas procesadas correctamente.',
  })
  @ApiResponse({
    status: 403,
    description: 'El usuario no tiene permisos suficientes.',
  })
  processOverdue() {
    return this.financeService.processOverdueObligations();
  }

  @Get('student/:studentId/status')
  @Roles('ADMIN', 'RECEPCIONISTA')
  @ApiOperation({
    summary: 'Consultar estado financiero del estudiante',
    description:
      'Consulta el estado de las obligaciones y pagos asociados a un estudiante.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado financiero obtenido correctamente.',
  })
  @ApiResponse({
    status: 403,
    description: 'El usuario no tiene permisos suficientes.',
  })
  @ApiResponse({
    status: 404,
    description: 'Estudiante no encontrado.',
  })
  studentFinancialStatus(
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.financeService.checkStudentFinancialStatus(
      studentId,
    );
  }

  @Post('payments/checkout')
  @Roles('ESTUDIANTE', 'ADMIN', 'RECEPCIONISTA')
  @ApiOperation({
    summary: 'Iniciar checkout de MockPay',
    description:
      'Registra un pago pendiente y solicita a MockPay una URL de checkout.',
  })
  @ApiResponse({
    status: 201,
    description: 'Checkout creado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'El monto o la obligación no son válidos.',
  })
  @ApiResponse({
    status: 502,
    description: 'No fue posible iniciar el checkout externo.',
  })
  createGatewayCheckout(
    @Body() dto: CreateGatewayCheckoutDto,
  ) {
    return this.financeService.createGatewayCheckout(dto);
  }

}

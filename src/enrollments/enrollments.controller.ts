import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { UpdateEnrollmentResultDto } from './dto/update-enrollment-result.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@ApiTags('Enrollments')
@ApiBearerAuth('access-token')
@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentsController {
  constructor(
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  @Get()
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR')
  @ApiOperation({
    summary: 'Listar matrículas',
    description:
      'Obtiene todas las matrículas registradas en el sistema.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de matrículas obtenida correctamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description: 'El usuario no tiene permisos para consultar matrículas.',
  })
  findAll() {
    return this.enrollmentsService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR')
  @ApiOperation({
    summary: 'Obtener una matrícula',
    description: 'Obtiene una matrícula específica mediante su ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Matrícula obtenida correctamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description: 'El usuario no tiene permisos para consultar la matrícula.',
  })
  @ApiResponse({
    status: 404,
    description: 'La matrícula no fue encontrada.',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.enrollmentsService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'RECEPCIONISTA')
  @ApiOperation({
    summary: 'Crear una matrícula',
    description:
      'Registra la matrícula de un estudiante en un grupo académico.',
  })
  @ApiResponse({
    status: 201,
    description: 'Matrícula creada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Los datos enviados no son válidos.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description: 'El usuario no tiene permisos para crear matrículas.',
  })
  @ApiResponse({
    status: 409,
    description: 'El estudiante ya se encuentra matriculado en el grupo.',
  })
  create(@Body() dto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(dto);
  }

  @Patch(':id/result')
  @Roles('ADMIN', 'PROFESOR')
  @ApiOperation({
    summary: 'Actualizar resultado de matrícula',
    description:
      'Actualiza la calificación y el resultado final de una matrícula.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultado de la matrícula actualizado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Los datos enviados no son válidos.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description: 'El usuario no tiene permisos para actualizar resultados.',
  })
  @ApiResponse({
    status: 404,
    description: 'La matrícula no fue encontrada.',
  })
  updateResult(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEnrollmentResultDto,
  ) {
    return this.enrollmentsService.updateResult(
      id,
      dto.grade,
      dto.result,
    );
  }
}

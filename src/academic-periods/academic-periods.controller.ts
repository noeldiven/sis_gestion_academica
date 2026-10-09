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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CreateAcademicPeriodDto } from './dto/create-academic-period.dto.js';
import { AcademicPeriodsService } from './academic-periods.service.js';

@ApiTags('Academic Periods')
@ApiBearerAuth('access-token')
@Controller('academic-periods')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AcademicPeriodsController {
  constructor(
    private readonly academicPeriodsService: AcademicPeriodsService,
  ) {}

  @Get()
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR')
  @ApiOperation({
    summary: 'Listar períodos académicos',
    description:
      'Obtiene todos los períodos académicos registrados, ordenados desde el más reciente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de períodos académicos obtenida correctamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'El usuario no tiene permisos para consultar los períodos académicos.',
  })
  findAll() {
    return this.academicPeriodsService.findAll();
  }

  @Get('active')
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR', 'ESTUDIANTE')
  @ApiOperation({
    summary: 'Obtener período académico activo',
    description:
      'Obtiene el período académico que actualmente se encuentra en estado ACTIVE.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Período académico activo obtenido correctamente. Puede devolver null si no existe un período activo.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'El usuario no tiene permisos para consultar el período activo.',
  })
  findActive() {
    return this.academicPeriodsService.findActive();
  }

  @Get(':id')
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR')
  @ApiOperation({
    summary: 'Obtener un período académico',
    description:
      'Obtiene un período académico específico mediante su ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Período académico obtenido correctamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'El usuario no tiene permisos para consultar el período académico.',
  })
  @ApiResponse({
    status: 404,
    description: 'El período académico no fue encontrado.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.academicPeriodsService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Crear período académico',
    description:
      'Crea un nuevo período académico verificando que el nombre sea único y que la fecha de inicio sea anterior a la fecha de finalización.',
  })
  @ApiResponse({
    status: 201,
    description: 'Período académico creado correctamente.',
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
    description:
      'El usuario no tiene permisos para crear períodos académicos.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Ya existe un período con ese nombre o las fechas proporcionadas no son válidas.',
  })
  create(@Body() dto: CreateAcademicPeriodDto) {
    return this.academicPeriodsService.create(dto);
  }

  @Patch(':id/activate')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Activar período académico',
    description:
      'Cambia el estado de un período académico a ACTIVE. Solo puede existir un período activo a la vez y un período CLOSED no puede volver a activarse.',
  })
  @ApiResponse({
    status: 200,
    description: 'Período académico activado correctamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'El usuario no tiene permisos para activar períodos académicos.',
  })
  @ApiResponse({
    status: 404,
    description: 'El período académico no fue encontrado.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Ya existe otro período activo o el período que se intenta activar está cerrado.',
  })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.academicPeriodsService.activate(id);
  }

  @Patch(':id/close')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Cerrar período académico',
    description:
      'Cambia el estado de un período académico ACTIVE a CLOSED.',
  })
  @ApiResponse({
    status: 200,
    description: 'Período académico cerrado correctamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'El usuario no tiene permisos para cerrar períodos académicos.',
  })
  @ApiResponse({
    status: 404,
    description: 'El período académico no fue encontrado.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Solo se puede cerrar un período académico que esté ACTIVE.',
  })
  close(@Param('id', ParseIntPipe) id: number) {
    return this.academicPeriodsService.close(id);
  }
}
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
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
import { CreateScheduleDto } from './dto/create-schedule.dto.js';
import { SchedulesService } from './schedules.service.js';

@ApiTags('Schedules')
@ApiBearerAuth()
@Controller('schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchedulesController {
  constructor(
    private readonly schedulesService: SchedulesService,
  ) {}

  @Get()
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR', 'ESTUDIANTE')
  @ApiOperation({
    summary: 'Listar horarios',
    description:
      'Obtiene todos los horarios registrados, incluyendo el grupo, asignatura, período académico y profesor asociado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de horarios obtenida correctamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'El usuario no tiene permisos para consultar los horarios.',
  })
  findAll() {
    return this.schedulesService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR', 'ESTUDIANTE')
  @ApiOperation({
    summary: 'Obtener un horario',
    description:
      'Obtiene un horario específico mediante su ID, incluyendo la información del grupo, asignatura, período académico y profesor.',
  })
  @ApiResponse({
    status: 200,
    description: 'Horario obtenido correctamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'El usuario no tiene permisos para consultar el horario.',
  })
  @ApiResponse({
    status: 404,
    description: 'El horario no fue encontrado.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.schedulesService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Crear horario',
    description:
      'Registra un nuevo horario para un grupo académico abierto. El horario no puede cruzarse con otro horario existente del mismo grupo.',
  })
  @ApiResponse({
    status: 201,
    description: 'Horario creado correctamente.',
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
      'El usuario no tiene permisos para crear horarios.',
  })
  @ApiResponse({
    status: 404,
    description: 'El grupo indicado no existe.',
  })
  @ApiResponse({
    status: 409,
    description:
      'El grupo está cerrado, la hora de inicio no es anterior a la hora de fin o existe un cruce con otro horario del grupo.',
  })
  create(@Body() dto: CreateScheduleDto) {
    return this.schedulesService.create(dto);
  }
}
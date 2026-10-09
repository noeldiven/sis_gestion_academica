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
import { CreateSubjectDto } from './dto/create-subject.dto.js';
import { UpdateSubjectStatusDto } from './dto/update-subject-status.dto.js';
import { SubjectsService } from './subjects.service.js';

@ApiTags('Subjects')
@ApiBearerAuth('access-token')
@Controller('subjects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubjectsController {
  constructor(
    private readonly subjectsService: SubjectsService,
  ) {}

  @Get()
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR', 'ESTUDIANTE')
  @ApiOperation({
    summary: 'Listar asignaturas',
    description:
      'Obtiene todas las asignaturas registradas en el sistema.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de asignaturas obtenida correctamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'El usuario no tiene permisos para consultar las asignaturas.',
  })
  findAll() {
    return this.subjectsService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR', 'ESTUDIANTE')
  @ApiOperation({
    summary: 'Obtener una asignatura',
    description:
      'Obtiene una asignatura específica mediante su ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Asignatura obtenida correctamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'El usuario no tiene permisos para consultar la asignatura.',
  })
  @ApiResponse({
    status: 404,
    description: 'La asignatura no fue encontrada.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subjectsService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Crear asignatura',
    description:
      'Registra una nueva asignatura verificando que su código no esté registrado previamente.',
  })
  @ApiResponse({
    status: 201,
    description: 'Asignatura creada correctamente.',
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
      'El usuario no tiene permisos para crear asignaturas.',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una asignatura con ese código.',
  })
  create(@Body() dto: CreateSubjectDto) {
    return this.subjectsService.create(dto);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Actualizar estado de una asignatura',
    description:
      'Activa o desactiva una asignatura mediante su ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de la asignatura actualizado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'El valor de active no es válido.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'El usuario no tiene permisos para modificar asignaturas.',
  })
  @ApiResponse({
    status: 404,
    description: 'La asignatura no fue encontrada.',
  })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubjectStatusDto,
  ) {
    return this.subjectsService.updateStatus(id, dto.active);
  }
}
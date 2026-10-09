import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service.js';
import { CreateAssignmentDto } from './dto/create-assignment.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    role: string;
    status: string;
  };
}

@ApiTags('Assignments')
@ApiBearerAuth('access-token')
@Controller('assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssignmentsController {
  constructor(
    private readonly assignmentsService: AssignmentsService,
  ) {}

  @Get()
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR', 'ESTUDIANTE')
  @ApiOperation({
    summary: 'Listar tareas',
    description:
      'Obtiene todas las tareas registradas, ordenadas por fecha de entrega.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tareas obtenida correctamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description: 'El usuario no tiene permisos para consultar las tareas.',
  })
  findAll() {
    return this.assignmentsService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR', 'ESTUDIANTE')
  @ApiOperation({
    summary: 'Obtener una tarea',
    description:
      'Obtiene una tarea específica mediante su ID, incluyendo su grupo y las entregas asociadas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tarea obtenida correctamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description: 'El usuario no tiene permisos para consultar la tarea.',
  })
  @ApiResponse({
    status: 404,
    description: 'La tarea no fue encontrada.',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.assignmentsService.findOne(id);
  }

  @Post()
  @Roles('PROFESOR')
  @ApiOperation({
    summary: 'Crear una tarea',
    description:
      'Crea una nueva tarea para un grupo al que pertenece el profesor autenticado. La fecha de entrega debe ser futura.',
  })
  @ApiResponse({
    status: 201,
    description: 'Tarea creada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Los datos enviados no son válidos o el grupo no está abierto.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'El usuario no tiene perfil de profesor o no pertenece al grupo indicado.',
  })
  @ApiResponse({
    status: 404,
    description: 'El grupo no fue encontrado.',
  })
  create(
    @Body() dto: CreateAssignmentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.assignmentsService.create(
      dto,
      req.user.id,
    );
  }
}

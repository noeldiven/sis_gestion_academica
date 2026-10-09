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
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SubmissionsService } from './submissions.service.js';
import { CreateSubmissionDto } from './dto/create-submission.dto.js';
import { GradeSubmissionDto } from './dto/grade-submission.dto.js';
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

@ApiTags('Submissions')
@ApiBearerAuth('access-token')
@Controller('submissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubmissionsController {
  constructor(
    private readonly submissionsService: SubmissionsService,
  ) {}

  @Get()
  @Roles('ADMIN', 'PROFESOR')
  @ApiOperation({
    summary: 'Listar entregas',
    description:
      'Obtiene todas las entregas de tareas registradas, incluyendo información de la tarea y del estudiante.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de entregas obtenida correctamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'El usuario no tiene permisos para consultar las entregas.',
  })
  findAll() {
    return this.submissionsService.findAll();
  }

  @Post()
  @Roles('ESTUDIANTE')
  @ApiOperation({
    summary: 'Crear una entrega',
    description:
      'Registra la entrega de una tarea por parte del estudiante autenticado. El estudiante debe estar matriculado en el grupo y la fecha límite no debe haber pasado.',
  })
  @ApiResponse({
    status: 201,
    description: 'Entrega registrada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description:
      'La fecha límite ha pasado o no se proporcionó contenido ni archivo.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'El estudiante no está matriculado en el grupo o su cuenta no está activa.',
  })
  @ApiResponse({
    status: 404,
    description:
      'El estudiante o la tarea no fueron encontrados.',
  })
  @ApiResponse({
    status: 409,
    description:
      'El estudiante ya entregó esta tarea.',
  })
  create(
    @Body() dto: CreateSubmissionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.submissionsService.create(
      dto,
      req.user.id,
    );
  }

  @Patch(':id/grade')
  @Roles('PROFESOR')
  @ApiOperation({
    summary: 'Calificar una entrega',
    description:
      'Asigna una calificación a una entrega. La nota debe estar entre 0 y 20.',
  })
  @ApiResponse({
    status: 200,
    description: 'Entrega calificada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'La calificación debe estar entre 0 y 20.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'El usuario no tiene permisos para calificar entregas.',
  })
  @ApiResponse({
    status: 404,
    description: 'La entrega no fue encontrada.',
  })
  grade(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: GradeSubmissionDto,
  ) {
    return this.submissionsService.grade(
      id,
      dto.grade,
    );
  }
}

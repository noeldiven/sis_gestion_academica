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
import { CreateTeacherDto } from './dto/create-teacher.dto.js';
import { TeachersService } from './teachers.service.js';

@ApiTags('Teachers')
@ApiBearerAuth()
@Controller('teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeachersController {
  constructor(
    private readonly teachersService: TeachersService,
  ) {}

  @Get()
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR')
  @ApiOperation({
    summary: 'Listar profesores',
    description:
      'Obtiene todos los perfiles de profesores registrados en el sistema.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de profesores obtenida correctamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'El usuario no tiene permisos para consultar profesores.',
  })
  findAll() {
    return this.teachersService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR')
  @ApiOperation({
    summary: 'Obtener un profesor',
    description:
      'Obtiene un perfil de profesor mediante su ID, incluyendo sus grupos asociados.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profesor obtenido correctamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'El usuario no tiene permisos para consultar el profesor.',
  })
  @ApiResponse({
    status: 404,
    description: 'El profesor no fue encontrado.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teachersService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Crear perfil de profesor',
    description:
      'Crea un perfil de profesor asociado a un usuario que tenga el rol PROFESOR y se encuentre activo.',
  })
  @ApiResponse({
    status: 201,
    description: 'Perfil de profesor creado correctamente.',
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
      'El usuario no tiene permisos para crear profesores.',
  })
  @ApiResponse({
    status: 404,
    description: 'El usuario indicado no existe.',
  })
  @ApiResponse({
    status: 409,
    description:
      'El usuario no tiene el rol PROFESOR, no está activo o ya tiene un perfil de profesor.',
  })
  create(@Body() dto: CreateTeacherDto) {
    return this.teachersService.create(dto);
  }
}

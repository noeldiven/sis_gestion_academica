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
import { CreateGroupDto } from './dto/create-group.dto.js';
import { GroupsService } from './groups.service.js';

@ApiTags('Groups')
@ApiBearerAuth('access-token')
@Controller('groups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GroupsController {
  constructor(
    private readonly groupsService: GroupsService,
  ) {}

  @Get()
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR', 'ESTUDIANTE')
  @ApiOperation({
    summary: 'Listar grupos académicos',
    description:
      'Obtiene todos los grupos académicos registrados, incluyendo la asignatura, período, profesor y horarios asociados.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de grupos obtenida correctamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'El usuario no tiene permisos para consultar grupos.',
  })
  findAll() {
    return this.groupsService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR', 'ESTUDIANTE')
  @ApiOperation({
    summary: 'Obtener un grupo académico',
    description:
      'Obtiene un grupo específico mediante su ID, incluyendo la asignatura, período, profesor y horarios.',
  })
  @ApiResponse({
    status: 200,
    description: 'Grupo obtenido correctamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'El usuario no tiene permisos para consultar el grupo.',
  })
  @ApiResponse({
    status: 404,
    description: 'El grupo académico no fue encontrado.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Crear grupo académico',
    description:
      'Crea un nuevo grupo académico asociado a una apertura de curso y a un profesor activo con rol PROFESOR.',
  })
  @ApiResponse({
    status: 201,
    description: 'Grupo académico creado correctamente.',
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
      'El usuario no tiene permisos para crear grupos.',
  })
  @ApiResponse({
    status: 404,
    description:
      'La apertura de curso o el profesor indicado no existen.',
  })
  @ApiResponse({
    status: 409,
    description:
      'La apertura está cerrada, el profesor no es válido o ya existe un grupo con ese nombre.',
  })
  create(@Body() dto: CreateGroupDto) {
    return this.groupsService.create(dto);
  }

  @Patch(':id/close')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Cerrar grupo académico',
    description:
      'Cambia el estado del grupo académico a CLOSED.',
  })
  @ApiResponse({
    status: 200,
    description: 'Grupo académico cerrado correctamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'El usuario no tiene permisos para cerrar grupos.',
  })
  @ApiResponse({
    status: 404,
    description: 'El grupo académico no fue encontrado.',
  })
  close(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.close(id);
  }
}

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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserStatusDto } from './dto/update-user-status.dto.js';
import { UsersService } from './users.service.js';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    role: string;
    status: string;
  };
}

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Obtener información del usuario autenticado',
    description: 'Devuelve los datos del usuario asociado al token JWT.',
  })
  @ApiResponse({
    status: 200,
    description: 'Información del usuario autenticado.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token no válido o no proporcionado.',
  })
  me(@Req() req: AuthenticatedRequest) {
    return this.usersService.findSafeById(req.user.id);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Listar usuarios',
    description: 'Obtiene todos los usuarios registrados en el sistema.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida correctamente.',
  })
  @ApiResponse({
    status: 403,
    description: 'El usuario no tiene permisos de administrador.',
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Crear usuario',
    description: 'Registra un nuevo usuario en el sistema.',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Los datos enviados no son válidos.',
  })
  @ApiResponse({
    status: 403,
    description: 'El usuario no tiene permisos para crear usuarios.',
  })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id/approve')
  @Roles('RECEPCIONISTA')
  @ApiOperation({
    summary: 'Aprobar estudiante',
    description: 'Aprueba un usuario que corresponde a un estudiante.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estudiante aprobado correctamente.',
  })
  @ApiResponse({
    status: 403,
    description: 'El usuario no tiene permisos de recepcionista.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado.',
  })
  approveStudent(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.approveStudent(id);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'RECEPCIONISTA')
  @ApiOperation({
    summary: 'Actualizar estado de usuario',
    description: 'Cambia el estado de un usuario.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Estado no válido.',
  })
  @ApiResponse({
    status: 403,
    description: 'El usuario no tiene permisos suficientes.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado.',
  })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateStatus(id, dto.status);
  }
}

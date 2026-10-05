import { Controller, Get } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesService } from './roles.service.js';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar roles',
    description:
      'Obtiene todos los roles registrados en el sistema ordenados por ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de roles obtenida correctamente.',
  })
  findAll() {
    return this.rolesService.findAll();
  }
}
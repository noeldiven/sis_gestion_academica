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
import { CreateCourseOfferingDto } from './dto/create-course-offering.dto.js';
import { CourseOfferingsService } from './course-offerings.service.js';

@ApiTags('Course Offerings')
@ApiBearerAuth('access-token')
@Controller('course-offerings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourseOfferingsController {
  constructor(
    private readonly courseOfferingsService: CourseOfferingsService,
  ) {}

  @Get()
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR', 'ESTUDIANTE')
  @ApiOperation({
    summary: 'Listar aperturas de asignaturas',
    description:
      'Obtiene todas las asignaturas abiertas en los diferentes períodos académicos, incluyendo la asignatura y el período correspondiente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de aperturas obtenida correctamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'El usuario no tiene permisos para consultar las aperturas.',
  })
  findAll() {
    return this.courseOfferingsService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR', 'ESTUDIANTE')
  @ApiOperation({
    summary: 'Obtener una apertura de asignatura',
    description:
      'Obtiene una apertura específica mediante su ID, incluyendo la asignatura y el período académico asociado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Apertura de asignatura obtenida correctamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'El usuario no tiene permisos para consultar la apertura.',
  })
  @ApiResponse({
    status: 404,
    description: 'La apertura de asignatura no fue encontrada.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.courseOfferingsService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Crear apertura de asignatura',
    description:
      'Abre una asignatura para un período académico activo. La asignatura debe estar activa y ser compatible con el ciclo académico cuando el tipo es REGULAR.',
  })
  @ApiResponse({
    status: 201,
    description: 'Apertura de asignatura creada correctamente.',
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
      'El usuario no tiene permisos para crear aperturas.',
  })
  @ApiResponse({
    status: 404,
    description:
      'La asignatura o el período académico indicado no existe.',
  })
  @ApiResponse({
    status: 409,
    description:
      'La asignatura está inactiva, el período no está activo, el ciclo no corresponde o la asignatura ya fue abierta en ese período.',
  })
  create(@Body() dto: CreateCourseOfferingDto) {
    return this.courseOfferingsService.create(dto);
  }

  @Patch(':id/close')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Cerrar apertura de asignatura',
    description:
      'Cambia el estado de una apertura de asignatura a CLOSED.',
  })
  @ApiResponse({
    status: 200,
    description: 'Apertura de asignatura cerrada correctamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'El usuario no tiene permisos para cerrar aperturas.',
  })
  @ApiResponse({
    status: 404,
    description: 'La apertura de asignatura no fue encontrada.',
  })
  close(@Param('id', ParseIntPipe) id: number) {
    return this.courseOfferingsService.close(id);
  }
}
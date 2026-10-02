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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CreateAcademicPeriodDto } from './dto/create-academic-period.dto.js';
import { AcademicPeriodsService } from './academic-periods.service.js';

@Controller('academic-periods')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AcademicPeriodsController {
  constructor(
    private readonly academicPeriodsService: AcademicPeriodsService,
  ) {}

  @Get()
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR')
  findAll() {
    return this.academicPeriodsService.findAll();
  }

  @Get('active')
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR', 'ESTUDIANTE')
  findActive() {
    return this.academicPeriodsService.findActive();
  }

  @Get(':id')
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.academicPeriodsService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateAcademicPeriodDto) {
    return this.academicPeriodsService.create(dto);
  }

  @Patch(':id/activate')
  @Roles('ADMIN')
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.academicPeriodsService.activate(id);
  }

  @Patch(':id/close')
  @Roles('ADMIN')
  close(@Param('id', ParseIntPipe) id: number) {
    return this.academicPeriodsService.close(id);
  }
}
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CreateScheduleDto } from './dto/create-schedule.dto.js';
import { SchedulesService } from './schedules.service.js';

@Controller('schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchedulesController {
  constructor(
    private readonly schedulesService: SchedulesService,
  ) {}

  @Get()
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR', 'ESTUDIANTE')
  findAll() {
    return this.schedulesService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR', 'ESTUDIANTE')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.schedulesService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateScheduleDto) {
    return this.schedulesService.create(dto);
  } 
}
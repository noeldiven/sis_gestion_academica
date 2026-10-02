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
import { CreateTeacherDto } from './dto/create-teacher.dto.js';
import { TeachersService } from './teachers.service.js';

@Controller('teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeachersController {
  constructor(
    private readonly teachersService: TeachersService,
  ) {}

  @Get()
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR')
  findAll() {
    return this.teachersService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teachersService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateTeacherDto) {
    return this.teachersService.create(dto);
  }
}

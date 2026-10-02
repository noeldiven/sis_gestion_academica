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
import { CreateSubjectDto } from './dto/create-subject.dto.js';
import { SubjectsService } from './subjects.service.js';

@Controller('subjects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubjectsController {
  constructor(
    private readonly subjectsService: SubjectsService,
  ) {}

  @Get()
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR', 'ESTUDIANTE')
  findAll() {
    return this.subjectsService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR', 'ESTUDIANTE')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subjectsService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateSubjectDto) {
    return this.subjectsService.create(dto);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('active') active: boolean,
  ) {
    return this.subjectsService.updateStatus(id, active);
  }
}
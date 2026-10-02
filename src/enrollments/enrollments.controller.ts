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
import { EnrollmentResult } from '../generated/prisma/enums.js';
import { EnrollmentsService } from './enrollments.service.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentsController {
  constructor(
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  @Get()
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR')
  findAll() {
    return this.enrollmentsService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.enrollmentsService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'RECEPCIONISTA')
  create(@Body() dto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(dto);
  }

  @Patch(':id/result')
  @Roles('ADMIN', 'PROFESOR')
  updateResult(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      grade: number;
      result: EnrollmentResult;
    },
  ) {
    return this.enrollmentsService.updateResult(
      id,
      body.grade,
      body.result,
    );
  }
}
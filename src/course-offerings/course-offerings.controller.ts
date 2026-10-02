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
import { CreateCourseOfferingDto } from './dto/create-course-offering.dto.js';
import { CourseOfferingsService } from './course-offerings.service.js';

@Controller('course-offerings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourseOfferingsController {
  constructor(
    private readonly courseOfferingsService: CourseOfferingsService,
  ) {}

  @Get()
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR', 'ESTUDIANTE')
  findAll() {
    return this.courseOfferingsService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR', 'ESTUDIANTE')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.courseOfferingsService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateCourseOfferingDto) {
    return this.courseOfferingsService.create(dto);
  }

  @Patch(':id/close')
  @Roles('ADMIN')
  close(@Param('id', ParseIntPipe) id: number) {
    return this.courseOfferingsService.close(id);
  }
}
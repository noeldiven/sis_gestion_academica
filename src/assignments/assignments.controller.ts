import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AssignmentsService } from './assignments.service.js';
import { CreateAssignmentDto } from './dto/create-assignment.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    role: string;
    status: string;
  };
}

@Controller('assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssignmentsController {
  constructor(
    private readonly assignmentsService: AssignmentsService,
  ) {}

  @Get()
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR', 'ESTUDIANTE')
  findAll() {
    return this.assignmentsService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR', 'ESTUDIANTE')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.assignmentsService.findOne(id);
  }

  @Post()
  @Roles('PROFESOR')
  create(
    @Body() dto: CreateAssignmentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.assignmentsService.create(
      dto,
      req.user.id,
    );
  }
}
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
import { Request } from 'express';
import { SubmissionsService } from './submissions.service.js';
import { CreateSubmissionDto } from './dto/create-submission.dto.js';
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

@Controller('submissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubmissionsController {
  constructor(
    private readonly submissionsService: SubmissionsService,
  ) {}

  @Get()
  @Roles('ADMIN', 'PROFESOR')
  findAll() {
    return this.submissionsService.findAll();
  }

  @Post()
  @Roles('ESTUDIANTE')
  create(
    @Body() dto: CreateSubmissionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.submissionsService.create(
      dto,
      req.user.id,
    );
  }

  @Patch(':id/grade')
  @Roles('PROFESOR')
  grade(
    @Param('id', ParseIntPipe) id: number,
    @Body('grade') grade: number,
  ) {
    return this.submissionsService.grade(
      id,
      grade,
    );
  }
}
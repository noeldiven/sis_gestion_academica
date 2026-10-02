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
import { CreateGroupDto } from './dto/create-group.dto.js';
import { GroupsService } from './groups.service.js';

@Controller('groups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GroupsController {
  constructor(
    private readonly groupsService: GroupsService,
  ) {}

  @Get()
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR', 'ESTUDIANTE')
  findAll() {
    return this.groupsService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'RECEPCIONISTA', 'PROFESOR', 'ESTUDIANTE')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateGroupDto) {
    return this.groupsService.create(dto);
  }

  @Patch(':id/close')
  @Roles('ADMIN')
  close(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.close(id);
  }
}
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByName(name: string) {
    return this.prisma.role.findUnique({
      where: { name },
    });
  }

  async findAll() {
    return this.prisma.role.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }

  async create(name: string) {
    return this.prisma.role.create({
      data: {
        name,
      },
    });
  }
}
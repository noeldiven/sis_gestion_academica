import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssignmentDto {
  @ApiProperty({
    example: 1,
    description: 'ID del grupo académico al que pertenece la tarea',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  groupId: number;

  @ApiProperty({
    example: 'Tarea 1 - Introducción al curso',
    description: 'Título de la tarea',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example:
      'Resolver los ejercicios correspondientes a la primera unidad.',
    description: 'Descripción y consignas de la tarea',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: '2026-10-30T23:59:00.000Z',
    description:
      'Fecha y hora límite para entregar la tarea en formato ISO 8601',
  })
  @IsDateString()
  dueDate: string;
}

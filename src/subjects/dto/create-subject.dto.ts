import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SemesterType } from '../../generated/prisma/enums.js';

export class CreateSubjectDto {
  @ApiProperty({
    example: 'MAT101',
    description: 'Código único de la asignatura',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    example: 'Matemática I',
    description: 'Nombre de la asignatura',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 4,
    description: 'Cantidad de créditos de la asignatura',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  credits: number;

  @ApiProperty({
    enum: SemesterType,
    example: SemesterType.ODD,
    description: 'Ciclo o semestre en el que corresponde la asignatura',
  })
  @IsEnum(SemesterType)
  semesterType: SemesterType;

  @ApiProperty({
    example: 100,
    description: 'Costo de matrícula o inscripción de la asignatura',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  enrollmentCost: number;

  @ApiProperty({
    example: 250,
    description: 'Costo mensual de la asignatura',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  monthlyCost: number;
}
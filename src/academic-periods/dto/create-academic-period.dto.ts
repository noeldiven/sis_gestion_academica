import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SemesterType } from '../../generated/prisma/enums.js';

export class CreateAcademicPeriodDto {
  @ApiProperty({
    example: '2026-I',
    description: 'Nombre único del período académico',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '2026-03-01',
    description:
      'Fecha de inicio del período académico en formato ISO 8601',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    example: '2026-07-31',
    description:
      'Fecha de finalización del período académico en formato ISO 8601',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    enum: SemesterType,
    example: SemesterType.ODD,
    description: 'Ciclo o semestre al que corresponde el período académico',
  })
  @IsEnum(SemesterType)
  semesterType: SemesterType;

  @ApiProperty({
    example: 24,
    description: 'Cantidad máxima de créditos permitidos en el período',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  maxCredits: number;

  @ApiProperty({
    example: 1500,
    description: 'Costo regular del período académico',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  regularFee: number;
}
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
import { FinancialObligationType } from '../../generated/prisma/enums.js';

export class CreateFinancialObligationDto {
  @ApiProperty({
    example: 1,
    description: 'ID del estudiante al que pertenece la obligación',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  studentId: number;

  @ApiProperty({
    example: 1,
    description: 'ID del período académico',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  academicPeriodId: number;

  @ApiProperty({
    enum: FinancialObligationType,
    description: 'Tipo de obligación financiera',
    example: Object.values(FinancialObligationType)[0],
  })
  @IsEnum(FinancialObligationType)
  type: FinancialObligationType;

  @ApiProperty({
    example: 'Matrícula del período académico',
    description: 'Descripción de la obligación financiera',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 350.00,
    description: 'Monto total de la obligación',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    example: '2026-10-30',
    description: 'Fecha límite de pago en formato ISO 8601',
  })
  @IsDateString()
  dueDate: string;
}

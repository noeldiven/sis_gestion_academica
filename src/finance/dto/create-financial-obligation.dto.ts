import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { FinancialObligationType } from '../../generated/prisma/enums.js';

export class CreateFinancialObligationDto {
  @IsInt()
  @Min(1)
  studentId: number;

  @IsInt()
  @Min(1)
  academicPeriodId: number;

  @IsEnum(FinancialObligationType)
  type: FinancialObligationType;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString()
  dueDate: string;
}
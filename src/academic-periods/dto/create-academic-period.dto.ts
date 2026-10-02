import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { SemesterType } from '../../generated/prisma/enums.js';

export class CreateAcademicPeriodDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsEnum(SemesterType)
  semesterType: SemesterType;

  @IsInt()
  @Min(1)
  maxCredits: number;

  @IsNumber()
  @Min(0)
  regularFee: number;
}
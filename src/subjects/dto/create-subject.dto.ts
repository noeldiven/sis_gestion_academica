import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { SemesterType } from '../../generated/prisma/enums.js';

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1)
  credits: number;

  @IsEnum(SemesterType)
  semesterType: SemesterType;

  @IsNumber()
  @Min(0)
  enrollmentCost: number;

  @IsNumber()
  @Min(0)
  monthlyCost: number;
}
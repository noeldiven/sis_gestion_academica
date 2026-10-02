import { IsEnum, IsInt, Min } from 'class-validator';
import {
  CourseOfferingType,
} from '../../generated/prisma/enums.js';

export class CreateCourseOfferingDto {
  @IsInt()
  @Min(1)
  subjectId: number;

  @IsInt()
  @Min(1)
  academicPeriodId: number;

  @IsEnum(CourseOfferingType)
  type: CourseOfferingType;
}
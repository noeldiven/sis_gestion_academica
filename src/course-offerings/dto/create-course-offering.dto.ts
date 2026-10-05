import { IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  CourseOfferingType,
} from '../../generated/prisma/enums.js';

export class CreateCourseOfferingDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la asignatura que se desea abrir',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  subjectId: number;

  @ApiProperty({
    example: 1,
    description: 'ID del período académico en el que se abrirá la asignatura',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  academicPeriodId: number;

  @ApiProperty({
    enum: CourseOfferingType,
    example: CourseOfferingType.REGULAR,
    description:
      'Tipo de apertura de la asignatura dentro del período académico',
  })
  @IsEnum(CourseOfferingType)
  type: CourseOfferingType;
}
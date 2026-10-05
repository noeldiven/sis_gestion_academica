import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEnrollmentDto {
  @ApiProperty({
    example: 1,
    description: 'ID del estudiante que será matriculado',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  studentId: number;

  @ApiProperty({
    example: 1,
    description: 'ID del grupo académico en el que se matriculará el estudiante',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  groupId: number;
}

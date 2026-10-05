import { ApiProperty } from '@nestjs/swagger';

export class GradeSubmissionDto {
  @ApiProperty({
    example: 18.5,
    description: 'Calificación asignada a la entrega. Debe estar entre 0 y 20.',
    minimum: 0,
    maximum: 20,
  })
  grade: number;
}

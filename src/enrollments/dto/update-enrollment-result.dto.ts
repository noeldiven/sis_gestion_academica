import { ApiProperty } from '@nestjs/swagger';
import { EnrollmentResult } from '../../generated/prisma/enums.js';

export class UpdateEnrollmentResultDto {
  @ApiProperty({
    example: 18.5,
    description: 'Calificación obtenida por el estudiante',
  })
  grade: number;

  @ApiProperty({
    enum: EnrollmentResult,
    example: EnrollmentResult.PASSED,
    description: 'Resultado final de la matrícula',
  })
  result: EnrollmentResult;
}

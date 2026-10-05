import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateSubjectStatusDto {
  @ApiProperty({
    example: true,
    description:
      'Indica si la asignatura estará activa y disponible para nuevas aperturas.',
  })
  @IsBoolean()
  active: boolean;
}
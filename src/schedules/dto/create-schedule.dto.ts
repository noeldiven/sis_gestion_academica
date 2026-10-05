import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateScheduleDto {
  @ApiProperty({
    example: 1,
    description: 'ID del grupo académico al que pertenece el horario',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  groupId: number;

  @ApiProperty({
    example: 1,
    description:
      'Día de la semana en el que se desarrollará la clase. 1 = lunes y 7 = domingo.',
    minimum: 1,
    maximum: 7,
  })
  @IsInt()
  @Min(1)
  @Max(7)
  dayOfWeek: number;

  @ApiProperty({
    example: '08:00',
    description: 'Hora de inicio de la clase en formato HH:mm',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'startTime debe tener formato HH:mm',
  })
  startTime: string;

  @ApiProperty({
    example: '10:00',
    description: 'Hora de finalización de la clase en formato HH:mm',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'endTime debe tener formato HH:mm',
  })
  endTime: string;
}
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeacherDto {
  @ApiProperty({
    example: 2,
    description: 'ID del usuario que tendrá el perfil de profesor',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  userId: number;

  @ApiProperty({
    example: 'Matemática y Física',
    description: 'Especialidad o área académica del profesor',
  })
  @IsString()
  @IsNotEmpty()
  specialty: string;

  @ApiProperty({
    example: '2026-03-01',
    description: 'Fecha de contratación del profesor en formato ISO 8601',
  })
  @IsDateString()
  hireDate: string;
}

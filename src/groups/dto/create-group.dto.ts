import {
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la apertura de curso a la que pertenece el grupo',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  courseOfferingId: number;

  @ApiProperty({
    example: 1,
    description: 'ID del profesor asignado al grupo',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  teacherId: number;

  @ApiProperty({
    example: 'GRUPO A',
    description: 'Nombre o identificador del grupo académico',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Aula 101',
    description: 'Aula donde se desarrollarán las clases',
  })
  @IsString()
  @IsNotEmpty()
  classroom: string;

  @ApiProperty({
    example: 30,
    description: 'Cantidad máxima de estudiantes permitidos en el grupo',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  capacity: number;
}

import {
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubmissionDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la tarea que desea entregar el estudiante',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  assignmentId: number;

  @ApiPropertyOptional({
    example: 'He desarrollado los ejercicios solicitados en la tarea.',
    description: 'Contenido de la entrega. Es opcional si se proporciona un archivo.',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/entregas/tarea-1.pdf',
    description: 'URL del archivo de la entrega. Es opcional si se proporciona contenido.',
  })
  @IsOptional()
  @IsString()
  fileUrl?: string;
}

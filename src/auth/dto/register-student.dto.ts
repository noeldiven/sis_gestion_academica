import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../../generated/prisma/enums.js';

export class RegisterStudentDto {
  @ApiProperty({
    example: 'estudiante@sgaf.com',
    description: 'Correo electrónico del estudiante',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Estudiante123*',
    description: 'Contraseña del estudiante. Mínimo 6 caracteres',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo del apoderado',
  })
  @IsString()
  @IsNotEmpty()
  guardianName: string;

  @ApiProperty({
    example: '987654321',
    description: 'Número telefónico del apoderado',
  })
  @IsString()
  @IsNotEmpty()
  guardianPhone: string;

  @ApiProperty({
    enum: PaymentMethod,
    example: 'CASH',
    description: 'Método de pago seleccionado por el estudiante',
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}

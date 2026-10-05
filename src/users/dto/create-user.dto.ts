import {
  IsEmail,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'usuario@sgaf.com',
    description: 'Correo electrónico del usuario',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Usuario123*',
    description: 'Contraseña del usuario. Mínimo 6 caracteres',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 2,
    description: 'ID del rol asignado al usuario',
  })
  @IsNumber()
  roleId: number;
}

import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'recepcion@sgaf.com',
    description: 'Correo electrónico registrado del usuario',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Admin123*',
    description: 'Contraseña del usuario',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}

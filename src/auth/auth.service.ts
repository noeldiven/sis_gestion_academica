import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { RegisterStudentDto } from './dto/register-student.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException(
        'El usuario no está activo',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
        role: user.role,
      },
    };
  }

  async registerStudent(dto: RegisterStudentDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException(
        'El correo ya está registrado',
      );
    }

    return this.usersService.createStudent(dto);
  }
}
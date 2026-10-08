import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';
import { UsersService } from '../../users/users.service.js';

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(
      payload.sub,
    );

    if (!user) {
      throw new UnauthorizedException(
        'Usuario no encontrado',
      );
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException(
        'El usuario no está activo',
      );
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role.name,
      status: user.status,
    };
  }
}
import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserStatusDto {
  @ApiProperty({
    example: 'ACTIVE',
    description: 'Nuevo estado del usuario',
    enum: ['ACTIVE', 'SUSPENDED', 'INACTIVE'],
  })
  @IsIn(['ACTIVE', 'SUSPENDED', 'INACTIVE'])
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
}

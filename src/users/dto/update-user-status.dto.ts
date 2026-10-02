import { IsIn } from 'class-validator';

export class UpdateUserStatusDto {
  @IsIn(['ACTIVE', 'SUSPENDED', 'INACTIVE'])
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
}
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';

export class CreateGroupDto {
  @IsInt()
  @Min(1)
  courseOfferingId: number;

  @IsInt()
  @Min(1)
  teacherId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  classroom: string;

  @IsInt()
  @Min(1)
  capacity: number;
}
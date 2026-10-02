import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';

export class CreateTeacherDto {
  @IsInt()
  @Min(1)
  userId: number;

  @IsString()
  @IsNotEmpty()
  specialty: string;

  @IsDateString()
  hireDate: string;
}
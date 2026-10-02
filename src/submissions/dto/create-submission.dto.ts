import {
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateSubmissionDto {
  @IsInt()
  @Min(1)
  assignmentId: number;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;
}
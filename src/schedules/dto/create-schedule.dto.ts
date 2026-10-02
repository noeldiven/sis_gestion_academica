import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  Matches,
} from 'class-validator';

export class CreateScheduleDto {
  @IsInt()
  @Min(1)
  groupId: number;

  @IsInt()
  @Min(1)
  @Max(7)
  dayOfWeek: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'startTime debe tener formato HH:mm',
  })
  startTime: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'endTime debe tener formato HH:mm',
  })
  endTime: string;
}
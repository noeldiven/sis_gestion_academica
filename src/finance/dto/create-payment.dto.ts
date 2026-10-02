import {
  IsEnum,
  IsInt,
  IsNumber,
  Min,
} from 'class-validator';
import { PaymentMethod } from '../../generated/prisma/enums.js';

export class CreatePaymentDto {
  @IsInt()
  @Min(1)
  financialObligationId: number;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}
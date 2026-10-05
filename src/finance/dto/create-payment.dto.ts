import {
  IsEnum,
  IsInt,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../../generated/prisma/enums.js';

export class CreatePaymentDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la obligación financiera que se desea pagar',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  financialObligationId: number;

  @ApiProperty({
    example: 350.00,
    description: 'Monto del pago',
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    enum: PaymentMethod,
    example: Object.values(PaymentMethod)[0],
    description: 'Método utilizado para realizar el pago',
  })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}

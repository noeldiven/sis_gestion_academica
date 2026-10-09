
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Min } from 'class-validator';

export class CreateGatewayCheckoutDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la obligación financiera que se desea pagar',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  financialObligationId: number;

  @ApiProperty({
    example: 120.5,
    description: 'Monto del pago en USD',
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  amount: number;
}

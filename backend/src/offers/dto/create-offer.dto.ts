import { IsBoolean, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateOfferDto {
  @IsInt()
  @Min(1)
  itemId: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsBoolean()
  hidden?: boolean;
}

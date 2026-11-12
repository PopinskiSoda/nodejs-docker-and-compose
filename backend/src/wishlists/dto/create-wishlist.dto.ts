import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsString,
  IsUrl,
  Length,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateWishlistDto {
  @IsString()
  @Length(1, 250)
  name: string;

  @IsString()
  @MaxLength(1500)
  description: string;

  @IsUrl()
  image: string;

  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  itemsId: number[];
}

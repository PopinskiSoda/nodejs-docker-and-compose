import { PartialType } from '@nestjs/mapped-types';
import { CreateWishDto } from './create-wish.dto.js';

export class UpdateWishDto extends PartialType(CreateWishDto) {}

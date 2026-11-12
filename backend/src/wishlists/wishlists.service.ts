import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { WishesService } from '../wishes/wishes.service.js';
import { CreateWishlistDto } from './dto/create-wishlist.dto.js';
import { UpdateWishlistDto } from './dto/update-wishlist.dto.js';
import { Wishlist } from './entities/wishlist.entity.js';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlists: Repository<Wishlist>,
    private readonly wishesService: WishesService,
  ) {}

  async create(dto: CreateWishlistDto, owner: User): Promise<Wishlist> {
    const items = await this.wishesService.findByIds(dto.itemsId);
    const { itemsId: _itemsId, ...wishlistData } = dto;
    return this.wishlists.save(
      this.wishlists.create(
        Object.assign(new Wishlist(), wishlistData, { items, owner }),
      ),
    );
  }

  async findOne(where: FindOptionsWhere<Wishlist>): Promise<Wishlist> {
    const wishlist = await this.wishlists.findOne({ where });
    if (!wishlist) throw new NotFoundException('Подборка не найдена');
    return wishlist;
  }

  findMany(where?: FindOptionsWhere<Wishlist>): Promise<Wishlist[]> {
    return this.wishlists.find({ where });
  }

  async updateOne(
    where: FindOptionsWhere<Wishlist>,
    dto: UpdateWishlistDto,
  ): Promise<Wishlist> {
    const wishlist = await this.findOne(where);
    const items = dto.itemsId
      ? await this.wishesService.findByIds(dto.itemsId)
      : wishlist.items;
    const { itemsId: _itemsId, ...wishlistData } = dto;
    await this.wishlists.save(
      this.wishlists.merge(
        wishlist,
        Object.assign(new Wishlist(), wishlistData, { items }),
      ),
    );
    return this.findOne({ id: wishlist.id });
  }

  async updateOwned(
    id: number,
    userId: number,
    dto: UpdateWishlistDto,
  ): Promise<Wishlist> {
    const wishlist = await this.findOne({ id });
    if (wishlist.owner.id !== userId)
      throw new ForbiddenException('Чужую подборку нельзя изменить');
    return this.updateOne({ id }, dto);
  }

  async removeOne(where: FindOptionsWhere<Wishlist>): Promise<void> {
    await this.wishlists.remove(await this.findOne(where));
  }

  async removeOwned(id: number, userId: number): Promise<void> {
    const wishlist = await this.findOne({ id });
    if (wishlist.owner.id !== userId)
      throw new ForbiddenException('Чужую подборку нельзя удалить');
    await this.wishlists.remove(wishlist);
  }
}

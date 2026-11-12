import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { CreateWishDto } from './dto/create-wish.dto.js';
import { UpdateWishDto } from './dto/update-wish.dto.js';
import { Wish } from './entities/wish.entity.js';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish) private readonly wishes: Repository<Wish>,
  ) {}

  create(dto: CreateWishDto, owner: User): Promise<Wish> {
    return this.wishes.save(
      this.wishes.create(Object.assign(new CreateWishDto(), dto, { owner })),
    );
  }

  async findOne(where: FindOptionsWhere<Wish>, offers = true): Promise<Wish> {
    const wish = await this.wishes.findOne({
      where,
      relations: offers ? { offers: { user: true } } : undefined,
    });
    if (!wish) throw new NotFoundException('Подарок не найден');
    if (wish.offers) wish.offers = wish.offers.filter((offer) => !offer.hidden);
    return wish;
  }

  findMany(where?: FindOptionsWhere<Wish>): Promise<Wish[]> {
    return this.wishes.find({ where });
  }

  findLast(): Promise<Wish[]> {
    return this.wishes.find({ order: { createdAt: 'DESC' }, take: 40 });
  }

  findTop(): Promise<Wish[]> {
    return this.wishes.find({ order: { copied: 'DESC' }, take: 10 });
  }

  async findByIds(ids: number[]): Promise<Wish[]> {
    if (!ids.length) return [];
    const wishes = await this.wishes.findBy({ id: In(ids) });
    if (wishes.length !== ids.length)
      throw new NotFoundException('Один из подарков не найден');
    return wishes;
  }

  async updateOne(
    where: FindOptionsWhere<Wish>,
    dto: UpdateWishDto,
  ): Promise<Wish> {
    const wish = await this.findOne(where, false);
    await this.wishes.save(this.wishes.merge(wish, dto));
    return this.findOne({ id: wish.id });
  }

  async updateOwned(
    id: number,
    userId: number,
    dto: UpdateWishDto,
  ): Promise<Wish> {
    const wish = await this.findOne({ id });
    if (wish.owner.id !== userId)
      throw new ForbiddenException('Чужой подарок нельзя изменить');
    if (dto.price !== undefined && wish.raised > 0) {
      throw new BadRequestException('Нельзя менять цену после начала сбора');
    }
    return this.updateOne({ id }, dto);
  }

  async removeOne(where: FindOptionsWhere<Wish>): Promise<void> {
    await this.wishes.remove(await this.findOne(where, false));
  }

  async removeOwned(id: number, userId: number): Promise<void> {
    const wish = await this.findOne({ id });
    if (wish.owner.id !== userId)
      throw new ForbiddenException('Чужой подарок нельзя удалить');
    await this.wishes.remove(wish);
  }

  async copy(id: number, owner: User): Promise<Wish> {
    const original = await this.findOne({ id }, false);
    const copy = this.wishes.create({
      name: original.name,
      link: original.link,
      image: original.image,
      price: original.price,
      description: original.description,
      owner,
    });
    await this.wishes.increment({ id }, 'copied', 1);
    return this.wishes.save(copy);
  }
}

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { Wish } from '../wishes/entities/wish.entity.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { Offer } from './entities/offer.entity.js';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer) private readonly offers: Repository<Offer>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateOfferDto, user: User): Promise<Offer> {
    return this.dataSource.transaction(async (manager) => {
      const wish = await manager
        .createQueryBuilder(Wish, 'wish')
        .innerJoinAndSelect('wish.owner', 'owner')
        .where('wish.id = :id', { id: dto.itemId })
        .setLock('pessimistic_write')
        .getOne();
      if (!wish) throw new NotFoundException('Подарок не найден');
      if (wish.owner.id === user.id)
        throw new ForbiddenException('Нельзя скидываться на свой подарок');
      const remaining = Number((wish.price - wish.raised).toFixed(2));
      if (remaining <= 0)
        throw new BadRequestException('На подарок уже собрана вся сумма');
      if (dto.amount > remaining)
        throw new BadRequestException(
          `Сумма взноса не может превышать ${remaining}`,
        );
      wish.raised = Number((wish.raised + dto.amount).toFixed(2));
      await manager.save(wish);
      return manager.save(
        Offer,
        manager.create(Offer, {
          user,
          item: wish,
          amount: dto.amount,
          hidden: dto.hidden ?? false,
        }),
      );
    });
  }

  findMany(where?: FindOptionsWhere<Offer>): Promise<Offer[]> {
    return this.offers.find({
      where: { ...where, hidden: false },
      relations: { item: true },
    });
  }

  async findOne(where: FindOptionsWhere<Offer>): Promise<Offer> {
    const offer = await this.offers.findOne({
      where,
      relations: { item: true },
    });
    if (!offer) throw new NotFoundException('Заявка не найдена');
    return offer;
  }

  async updateOne(
    where: FindOptionsWhere<Offer>,
    changes: Partial<Offer>,
  ): Promise<Offer> {
    return this.offers.save(
      this.offers.merge(await this.findOne(where), changes),
    );
  }

  async removeOne(where: FindOptionsWhere<Offer>): Promise<void> {
    await this.offers.remove(await this.findOne(where));
  }
}

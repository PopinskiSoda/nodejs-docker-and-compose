import { Column, Entity, ManyToOne, type Relation } from 'typeorm';
import { IsBoolean, IsNumber, Min } from 'class-validator';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { moneyTransformer } from '../../common/transformers/money.transformer.js';
import { User } from '../../users/entities/user.entity.js';
import { Wish } from '../../wishes/entities/wish.entity.js';

@Entity()
export class Offer extends BaseEntity {
  @ManyToOne(() => User, (user) => user.offers, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: Relation<User>;

  @ManyToOne(() => Wish, (wish) => wish.offers, { onDelete: 'CASCADE' })
  item: Relation<Wish>;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: moneyTransformer,
  })
  amount: number;

  @IsBoolean()
  @Column({ default: false })
  hidden: boolean;
}

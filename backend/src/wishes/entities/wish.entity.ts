import { Column, Entity, ManyToOne, OneToMany, type Relation } from 'typeorm';
import { IsInt, IsNumber, IsString, IsUrl, Length, Min } from 'class-validator';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { moneyTransformer } from '../../common/transformers/money.transformer.js';
import { Offer } from '../../offers/entities/offer.entity.js';
import { User } from '../../users/entities/user.entity.js';

@Entity()
export class Wish extends BaseEntity {
  @IsString()
  @Length(1, 250)
  @Column({ length: 250 })
  name: string;

  @IsUrl()
  @Column()
  link: string;

  @IsUrl()
  @Column()
  image: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: moneyTransformer,
  })
  price: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: moneyTransformer,
  })
  raised: number;

  @ManyToOne(() => User, (user) => user.wishes, {
    eager: true,
    onDelete: 'CASCADE',
  })
  owner: Relation<User>;

  @IsString()
  @Length(1, 1024)
  @Column({ length: 1024 })
  description: string;

  @OneToMany(() => Offer, (offer) => offer.item)
  offers: Relation<Offer[]>;

  @IsInt()
  @Min(0)
  @Column({ type: 'integer', default: 0 })
  copied: number;
}

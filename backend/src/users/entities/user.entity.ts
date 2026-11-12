import { Exclude } from 'class-transformer';
import { IsEmail, IsString, IsUrl, Length } from 'class-validator';
import { Column, Entity, OneToMany, type Relation } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { Offer } from '../../offers/entities/offer.entity.js';
import { Wish } from '../../wishes/entities/wish.entity.js';
import { Wishlist } from '../../wishlists/entities/wishlist.entity.js';

@Entity()
export class User extends BaseEntity {
  @IsString()
  @Length(2, 30)
  @Column({ unique: true, length: 30 })
  username: string;

  @IsString()
  @Length(2, 200)
  @Column({ default: 'Пока ничего не рассказал о себе', length: 200 })
  about: string;

  @IsUrl()
  @Column({ default: 'https://i.pravatar.cc/300' })
  avatar: string;

  @Exclude()
  @IsEmail()
  @Column({ unique: true })
  email: string;

  @Exclude()
  @IsString()
  @Column({ select: false })
  password: string;

  @OneToMany(() => Wish, (wish) => wish.owner)
  wishes: Relation<Wish[]>;

  @OneToMany(() => Offer, (offer) => offer.user)
  offers: Relation<Offer[]>;

  @OneToMany(() => Wishlist, (wishlist) => wishlist.owner)
  wishlists: Relation<Wishlist[]>;
}

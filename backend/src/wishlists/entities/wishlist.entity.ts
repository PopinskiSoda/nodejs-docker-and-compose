import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  type Relation,
} from 'typeorm';
import { IsString, IsUrl, Length, MaxLength } from 'class-validator';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { Wish } from '../../wishes/entities/wish.entity.js';

@Entity()
export class Wishlist extends BaseEntity {
  @IsString()
  @Length(1, 250)
  @Column({ length: 250 })
  name: string;

  @IsString()
  @MaxLength(1500)
  @Column({ length: 1500 })
  description: string;

  @IsUrl()
  @Column()
  image: string;

  @ManyToMany(() => Wish, { eager: true })
  @JoinTable()
  items: Relation<Wish[]>;

  @ManyToOne(() => User, (user) => user.wishlists, {
    eager: true,
    onDelete: 'CASCADE',
  })
  owner: Relation<User>;
}

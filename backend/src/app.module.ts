import 'dotenv/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module.js';
import { OffersModule } from './offers/offers.module.js';
import { UsersModule } from './users/users.module.js';
import { WishesModule } from './wishes/wishes.module.js';
import { WishlistsModule } from './wishlists/wishlists.module.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST ?? 'localhost',
      port: Number(process.env.POSTGRES_PORT ?? 5432),
      username: process.env.POSTGRES_USER ?? 'student',
      password: process.env.POSTGRES_PASSWORD ?? 'student',
      database: process.env.POSTGRES_DB ?? 'kupipodariday',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    WishesModule,
    OffersModule,
    WishlistsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

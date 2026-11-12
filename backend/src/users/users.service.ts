import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { QueryFailedError } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    await this.assertUnique(dto.username, dto.email);
    const user = this.users.create(
      Object.assign(new CreateUserDto(), dto, {
        password: await bcrypt.hash(dto.password, 10),
      }),
    );
    try {
      return await this.users.save(user);
    } catch (error) {
      this.handleUniqueViolation(error);
    }
  }

  async findOne(where: FindOptionsWhere<User>): Promise<User> {
    const user = await this.users.findOne({ where });
    if (!user) throw new NotFoundException('Пользователь не найден');
    return user;
  }

  async findWithPassword(username: string): Promise<User | null> {
    return this.users
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.username = :username', { username })
      .getOne();
  }

  async findMany(query: string): Promise<User[]> {
    return this.users.find({
      where: [
        { username: ILike(`%${query}%`) },
        { email: ILike(`%${query}%`) },
      ],
    });
  }

  async updateOne(
    where: FindOptionsWhere<User>,
    dto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findOne(where);
    if (dto.username || dto.email) {
      await this.assertUnique(dto.username, dto.email, user.id);
    }
    const changes = Object.assign(new UpdateUserDto(), dto);
    if (dto.password) changes.password = await bcrypt.hash(dto.password, 10);
    try {
      await this.users.save(this.users.merge(user, changes));
    } catch (error) {
      this.handleUniqueViolation(error);
    }
    return this.findOne({ id: user.id });
  }

  async removeOne(where: FindOptionsWhere<User>): Promise<void> {
    const user = await this.findOne(where);
    await this.users.remove(user);
  }

  private async assertUnique(
    username?: string,
    email?: string,
    excludedId?: number,
  ): Promise<void> {
    if (!username && !email) return;
    const found = await this.users.findOne({
      where: [
        ...(username ? [{ username }] : []),
        ...(email ? [{ email }] : []),
      ],
    });
    if (found && found.id !== excludedId) {
      throw new ConflictException('Имя или email уже заняты');
    }
  }

  private handleUniqueViolation(error: unknown): never {
    if (
      error instanceof QueryFailedError &&
      (error.driverError as { code?: string }).code === '23505'
    ) {
      throw new ConflictException('Имя или email уже заняты');
    }
    throw error;
  }
}

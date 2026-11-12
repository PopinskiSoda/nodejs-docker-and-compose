import { validate } from 'class-validator';
import { CreateWishDto } from './wishes/dto/create-wish.dto.js';

describe('DTO validation', () => {
  it('rejects an invalid wish', async () => {
    const wish = Object.assign(new CreateWishDto(), {
      name: '',
      link: 'not-a-url',
      image: 'not-a-url',
      price: 0,
      description: '',
    });

    const errors = await validate(wish);
    expect(errors).toHaveLength(5);
  });
});

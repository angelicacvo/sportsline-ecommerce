import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOne(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

async create(data: any) {
  const newUser = this.userRepository.create(data);
  return this.userRepository.save(newUser);  // <--- devuelve un User, no un array
}

async createGoogleUser(data: any) {
  const user = this.userRepository.create({
    name: data.name,
    email: data.email,
    password: null,
    role: 'user',
    provider: 'google',
    providerId: data.providerId,
    avatar: data.avatar,
  });

  return await this.userRepository.save(user);
}


  async findAll() {
    return this.userRepository.find();
  }

  async update(id: number, data: any) {
    await this.userRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    return this.userRepository.delete(id);
  }
}

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, UserRoleDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existing = await this.userRepo.findOne({ where: { email: createUserDto.email } });
    if (existing) throw new BadRequestException('Email already in use');
    const user = this.userRepo.create({
      username: createUserDto.username,
      email: createUserDto.email,
      password: createUserDto.password, // TODO: hash password
    });
    if (createUserDto.role) {
      const mapped = createUserDto.role as unknown as UserRole;
      user.role = mapped;
    }
    return this.userRepo.save(user);
  }

  findAll() {
    return this.userRepo.find();
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOne({ where: { id: id.toString() } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id: id.toString() } });
    if (!user) throw new NotFoundException('User not found');
    if (updateUserDto['email']) {
      const existing = await this.userRepo.findOne({ where: { email: updateUserDto['email'] } });
      if (existing && existing.id !== id.toString()) {
        throw new BadRequestException('Email already in use');
      }
    }
    if (updateUserDto['role']) {
      (user as any).role = updateUserDto['role'] as unknown as UserRole;
      delete (updateUserDto as any)['role'];
    }
    Object.assign(user, updateUserDto);
    return this.userRepo.save(user);
  }

  async remove(id: number) {
    const user = await this.userRepo.findOne({ where: { id: id.toString() } });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepo.remove(user);
    return { message: 'User removed successfully' };
  }
}

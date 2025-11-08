import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create({
      name: createUserDto.username,
      email: createUserDto.email,
      password: createUserDto.password,
      role: createUserDto.role,
    });
    return this.userRepository.save(user);
  }

  findAll(){
    return this.userRepository.find();
  }
  findOne(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.userRepository.update(id, updateUserDto);
  }

  remove(id: string) {
    return this.userRepository.delete(id);
  }
}

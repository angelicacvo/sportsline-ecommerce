import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';

@Controller()
export class UsersMessageController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: 'users.create' })
  create(@Payload() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @MessagePattern({ cmd: 'create_user' })
  createUser(@Payload() dto: any) {
    return this.usersService.create(dto);
  }

  @MessagePattern({ cmd: 'users.findAll' })
  findAll() {
    return this.usersService.findAll();
  }

  @MessagePattern({ cmd: 'users.findOne' })
  findOne(@Payload() id: string) {
    return this.usersService.findOne(id);
  }

  @MessagePattern({ cmd: 'find_user_by_email' })
  findByEmail(@Payload() email: string) {
    return this.usersService.findByEmail(email);
  }

  @MessagePattern({ cmd: 'find_user_by_id' })
  findById(@Payload() id: number) {
    return this.usersService.findById(id);
  }

  @MessagePattern({ cmd: 'users.update' })
  update(@Payload() payload: { id: string; dto: UpdateUserDto }) {
    return this.usersService.update(payload.id, payload.dto);
  }

  @MessagePattern({ cmd: 'users.remove' })
  remove(@Payload() id: string) {
    return this.usersService.remove(id);
  }
}
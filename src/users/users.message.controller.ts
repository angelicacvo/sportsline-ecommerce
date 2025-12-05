import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { ApiKey } from './entities/api-key.entity';

@Controller()
export class UsersMessageController {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
  ) {}

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

  @MessagePattern({ cmd: 'create_api_key' })
  async createApiKey(@Payload() data: any) {
    const apiKey = this.apiKeyRepository.create({
      key: data.key,
      name: data.name,
      userId: data.userId,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    });
    
    return this.apiKeyRepository.save(apiKey);
  }

  @MessagePattern({ cmd: 'validate_api_key' })
  async validateApiKey(@Payload() data: { key: string }) {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { key: data.key, isActive: true },
      relations: ['user'],
    });

    if (!apiKey) {
      return null;
    }

    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
      return null;
    }

    // Update last used
    await this.apiKeyRepository.update(apiKey.id, { lastUsedAt: new Date() });

    return {
      userId: apiKey.user.id,
      email: apiKey.user.email,
      role: apiKey.user.role,
      name: apiKey.user.name,
    };
  }

  @MessagePattern({ cmd: 'list_api_keys' })
  async listApiKeys(@Payload() data: { userId: string }) {
    return this.apiKeyRepository.find({
      where: { userId: data.userId },
      select: ['id', 'name', 'isActive', 'expiresAt', 'lastUsedAt', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
  }

  @MessagePattern({ cmd: 'revoke_api_key' })
  async revokeApiKey(@Payload() data: { userId: string; keyId: string }) {
    const result = await this.apiKeyRepository.update(
      { id: data.keyId, userId: data.userId },
      { isActive: false },
    );
    
    return { success: (result.affected ?? 0) > 0 };
  }

  @MessagePattern({ cmd: 'find_by_email' })
  findUserByEmail(@Payload() data: { email: string }) {
    return this.usersService.findByEmail(data.email);
  }

  @MessagePattern({ cmd: 'create_oauth_user' })
  async createOAuthUser(@Payload() data: any) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(data.email);
    if (existingUser) {
      return existingUser;
    }

    // Create user without password (OAuth user)
    const user = await this.usersService.create({
      name: data.name,
      email: data.email,
      password: '',
      role: 'user',
    });

    return user;
  }
}
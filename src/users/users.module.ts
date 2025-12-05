import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersMessageController } from './users.message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ApiKey } from './entities/api-key.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, ApiKey])],
  controllers: [UsersMessageController],
  providers: [UsersService],
})
export class UsersModule {}

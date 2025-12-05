import {
  Injectable,
  UnauthorizedException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthResponse } from './interfaces/auth-response.interface';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject('USERS_SERVICE') private usersClient: ClientProxy,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Check if user exists
    const existingUser = await firstValueFrom(
      this.usersClient.send({ cmd: 'find_user_by_email' }, registerDto.email),
    ).catch(() => null);

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user via microservice
    const user = await firstValueFrom(
      this.usersClient.send(
        { cmd: 'create_user' },
        {
          ...registerDto,
          password: hashedPassword,
        },
      ),
    );

    return this.generateTokens(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    // Find user by email
    const user = await firstValueFrom(
      this.usersClient.send({ cmd: 'find_user_by_email' }, loginDto.email),
    ).catch(() => null);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async refreshToken(userId: number): Promise<AuthResponse> {
    // Find user by id
    const user = await firstValueFrom(
      this.usersClient.send({ cmd: 'find_user_by_id' }, userId),
    );

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.generateTokens(user);
  }

  async getProfile(userId: number) {
    const user = await firstValueFrom(
      this.usersClient.send({ cmd: 'find_user_by_id' }, userId),
    );

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Remove password from response
    const { password, ...result } = user;
    return result;
  }

  async createApiKey(userId: string, createApiKeyDto: CreateApiKeyDto) {
    const apiKey = `sk_${randomBytes(32).toString('hex')}`;
    
    const result = await firstValueFrom(
      this.usersClient.send(
        { cmd: 'create_api_key' },
        {
          key: apiKey,
          name: createApiKeyDto.name,
          userId,
          expiresAt: createApiKeyDto.expiresAt || null,
        },
      ),
    );

    return {
      id: result.id,
      key: apiKey,
      name: result.name,
      expiresAt: result.expiresAt,
      createdAt: result.createdAt,
    };
  }

  async validateApiKey(apiKey: string) {
    try {
      const result = await firstValueFrom(
        this.usersClient.send({ cmd: 'validate_api_key' }, { key: apiKey }),
      );
      return result;
    } catch (error) {
      return null;
    }
  }

  async listApiKeys(userId: string) {
    return firstValueFrom(
      this.usersClient.send({ cmd: 'list_api_keys' }, { userId }),
    );
  }

  async revokeApiKey(userId: string, keyId: string) {
    return firstValueFrom(
      this.usersClient.send({ cmd: 'revoke_api_key' }, { userId, keyId }),
    );
  }

  async googleLogin(req: any) {
    if (!req.user) {
      throw new UnauthorizedException('No user from Google');
    }

    // Check if user exists
    let user;
    try {
      user = await firstValueFrom(
        this.usersClient.send({ cmd: 'find_by_email' }, { email: req.user.email }),
      );
    } catch (error) {
      user = null;
    }

    // If user doesn't exist, create one
    if (!user) {
      user = await firstValueFrom(
        this.usersClient.send(
          { cmd: 'create_oauth_user' },
          {
            name: req.user.name,
            email: req.user.email,
            provider: 'google',
          },
        ),
      );
    }

    // Generate JWT tokens
    const tokens = await this.generateTokens(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  private generateTokens(user: any): AuthResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role || 'user',
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret:
        process.env.JWT_REFRESH_SECRET ||
        'your-refresh-secret-key-change-in-production',
      expiresIn: '7d',
    });

    const { password, ...userWithoutPassword } = user;

    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    };
  }
}

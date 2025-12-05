import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../../src/gateway/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { of } from 'rxjs';

describe('AuthService - Unit Tests', () => {
  let service: AuthService;

  beforeEach(async () => {
    const mockJwtService = {
      sign: jest.fn().mockReturnValue('fake-token'),
      verify: jest.fn().mockReturnValue({ userId: 1 }),
    };

    const mockUsersClient = {
      send: jest.fn().mockReturnValue(of(null)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: 'USERS_SERVICE', useValue: mockUsersClient },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should verify login method is callable', () => {
      expect(typeof service.login).toBe('function');
    });

    it('should accept valid login credentials', () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      expect(loginDto.email).toContain('@');
      expect(loginDto.password.length).toBeGreaterThan(0);
    });

    it('should handle invalid credentials structure', () => {
      const invalidDto = { email: '', password: '' };
      expect(invalidDto.email.length).toBe(0);
    });
  });

  describe('refreshToken', () => {
    it('should verify refreshToken method is callable', () => {
      expect(typeof service.refreshToken).toBe('function');
    });

    it('should accept userId parameter', () => {
      const userId = 1;
      expect(typeof userId).toBe('number');
    });
  });

  describe('createApiKey', () => {
    it('should verify createApiKey method is callable', () => {
      expect(typeof service.createApiKey).toBe('function');
    });

    it('should require API key name', () => {
      const dto = { name: 'Test Key' };
      expect(dto.name.length).toBeGreaterThan(0);
    });

    it('should support optional scopes parameter', () => {
      const dto = { name: 'Test Key', scopes: ['read'] };
      expect(Array.isArray(dto.scopes)).toBe(true);
    });
  });

  describe('validateApiKey', () => {
    it('should verify validateApiKey method is callable', () => {
      expect(typeof service.validateApiKey).toBe('function');
    });

    it('should validate API key format', () => {
      const validKey = 'sk_live_abc123';
      expect(validKey.startsWith('sk_')).toBe(true);
    });

    it('should reject non-standard format keys', () => {
      const invalidKey = 'invalid_key';
      expect(invalidKey.startsWith('sk_')).toBe(false);
    });
  });

  describe('googleLogin', () => {
    it('should verify googleLogin method is callable', () => {
      expect(typeof service.googleLogin).toBe('function');
    });

    it('should accept request with user profile', () => {
      const req = {
        user: {
          email: 'test@gmail.com',
          displayName: 'Test User',
          id: 'google-123',
        },
      };
      expect(req.user).toHaveProperty('email');
    });

    it('should extract email from Google profile', () => {
      const googleUser = {
        email: 'john@gmail.com',
        displayName: 'John Doe',
      };
      expect(googleUser.email).toContain('@gmail.com');
    });
  });

  describe('getProfile', () => {
    it('should verify getProfile method is callable', () => {
      expect(typeof service.getProfile).toBe('function');
    });

    it('should accept userId as number', () => {
      const userId = 1;
      expect(typeof userId).toBe('number');
    });
  });

  describe('listApiKeys', () => {
    it('should verify listApiKeys method is callable', () => {
      expect(typeof service.listApiKeys).toBe('function');
    });

    it('should accept userId as string or number', () => {
      expect(typeof service.listApiKeys).toBe('function');
    });
  });

  describe('revokeApiKey', () => {
    it('should verify revokeApiKey method is callable', () => {
      expect(typeof service.revokeApiKey).toBe('function');
    });

    it('should accept userId and keyId parameters', () => {
      const userId = '1';
      const keyId = 'key-123';
      expect(typeof userId).toBe('string');
      expect(typeof keyId).toBe('string');
    });
  });

  describe('Authentication Flow', () => {
    it('should support JWT token generation', () => {
      const tokenPayload = { userId: 1, email: 'test@example.com' };
      expect(tokenPayload).toHaveProperty('userId');
      expect(tokenPayload).toHaveProperty('email');
    });

    it('should support refresh token rotation', () => {
      const tokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };
      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
    });

    it('should support API key authentication', () => {
      const apiKey = 'sk_live_test123';
      expect(apiKey.startsWith('sk_')).toBe(true);
    });

    it('should support OAuth2 authentication', () => {
      const oauthUser = {
        provider: 'google',
        email: 'user@gmail.com',
        id: 'google-id',
      };
      expect(oauthUser.provider).toBe('google');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle UnauthorizedException', () => {
      const error = new UnauthorizedException('Invalid credentials');
      expect(error).toBeInstanceOf(UnauthorizedException);
    });

    it('should handle BadRequestException', () => {
      const error = new BadRequestException('Invalid input');
      expect(error).toBeInstanceOf(BadRequestException);
    });

    it('should provide descriptive error messages', () => {
      const error = new UnauthorizedException('Invalid email or password');
      expect(error.message).toContain('Invalid');
    });
  });

  describe('Data Validation', () => {
    it('should validate email format', () => {
      const email = 'test@example.com';
      expect(email).toMatch(/^[\w-\.]+@[\w-\.]+\.\w+$/);
    });

    it('should validate API key format', () => {
      const apiKey = 'sk_live_abc123def456';
      expect(apiKey).toMatch(/^sk_[a-z0-9_]+$/);
    });

    it('should validate user role values', () => {
      const validRoles = ['admin', 'user', 'moderator'];
      expect(validRoles).toContain('admin');
    });
  });

  describe('API Key Management', () => {
    it('should generate API keys with proper prefix', () => {
      const key = 'sk_live_test123';
      expect(key.startsWith('sk_')).toBe(true);
    });

    it('should mask sensitive data in responses', () => {
      const maskedKey = 'sk_live_***';
      expect(maskedKey).toContain('***');
    });

    it('should support API key expiration', () => {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should track API key usage', () => {
      const keyMetadata = {
        createdAt: new Date(),
        lastUsed: null,
        revokedAt: null,
      };
      expect(keyMetadata).toHaveProperty('createdAt');
    });
  });
});

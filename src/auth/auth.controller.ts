import { Body, Controller, HttpCode, HttpStatus, Get, Post, UseGuards, Request, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { AuthGuard } from './guards/auth.guard';
import { ApiKeyGuard, RequireApiKeyPermission } from './guards/api-key.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import type { Response } from 'express';

/**
 * @ApiTags() groups endpoints in Swagger UI
 * All endpoints in this controller will be grouped under "Authentication"
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    /**
     * @ApiOperation() describes what the endpoint does
     * @ApiBody() specifies the request body structure
     * @ApiResponse() documents possible responses
     */
    @ApiOperation({ 
        summary: 'Register a new user',  // Short description
        description: 'Creates a new user account with email, password, and optional role. Returns a JWT access token upon successful registration.'
    })
    @ApiBody({
        description: 'User registration data',
        schema: {
            type: 'object',
            properties: {
                username: { 
                    type: 'string', 
                    example: 'johndoe',
                    description: 'User\'s username'
                },
                email: { 
                    type: 'string', 
                    example: 'user@example.com',
                    description: 'User email address'
                },
                password: { 
                    type: 'string', 
                    example: 'SecurePass123!',
                    description: 'User password (min 6 characters)'
                },
                role: { 
                    type: 'string', 
                    example: 'customer',
                    enum: ['admin', 'customer', 'seller'],
                    description: 'User role (optional, defaults to customer)'
                },
            },
            required: ['username', 'email', 'password']
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: 'User successfully registered',
        schema: {
            type: 'object',
            properties: {
                accessToken: { 
                    type: 'string', 
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    description: 'Token de acceso (válido 1 hora)'
                },
                refreshToken: { 
                    type: 'string', 
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    description: 'Token de renovación (válido 7 días)'
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'User already exists' })
    @HttpCode(HttpStatus.OK)
    @Post('register')
    async registerUser(@Body() body: { username: string; email: string; password: string; role?: string }): Promise<{ accessToken: string; refreshToken: string }> {
        const { username, email, password, role } = body;
        return this.authService.registerUser(username, email, password, role);
    }

    @ApiOperation({ 
        summary: 'User login',
        description: 'Authenticates a user with email and password. Returns a JWT access token on success.'
    })
    @ApiBody({
        description: 'Login credentials',
        schema: {
            type: 'object',
            properties: {
                email: { 
                    type: 'string', 
                    example: 'user@example.com' 
                },
                password: { 
                    type: 'string', 
                    example: 'SecurePass123!' 
                },
            },
            required: ['email', 'password']
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully authenticated',
        schema: {
            type: 'object',
            properties: {
                accessToken: { 
                    type: 'string',
                    description: 'Token de acceso (válido 1 hora)'
                },
                refreshToken: { 
                    type: 'string',
                    description: 'Token de renovación (válido 7 días)'
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async signIn(@Body() signInDto: Record<string, string>): Promise<{ accessToken: string; refreshToken: string }> {
        const { email, password } = signInDto;
        return this.authService.signIn(email, password);
    }

    /**
     * @ApiBearerAuth() indicates this endpoint requires JWT authentication
     * Adds a lock icon in Swagger UI
     */
    @ApiOperation({ 
        summary: 'Refresh access token',
        description: 'Generates a new access token using a valid refresh token. Use this when your access token expires to avoid re-login.'
    })
    @ApiBody({
        description: 'Refresh token',
        schema: {
            type: 'object',
            properties: {
                refreshToken: { 
                    type: 'string', 
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    description: 'El refresh token recibido en login/register'
                }
            },
            required: ['refreshToken']
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: 'New access token generated',
        schema: {
            type: 'object',
            properties: {
                accessToken: { 
                    type: 'string',
                    description: 'Nuevo token de acceso (válido 1 hora)'
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    async refresh(@Body() body: { refreshToken: string }): Promise<{ accessToken: string }> {
        return this.authService.refreshAccessToken(body.refreshToken);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Get current user profile',
        description: 'Returns the authenticated user\'s profile information. Requires valid JWT token.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'User profile retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                sub: { type: 'number', example: 1 },
                email: { type: 'string', example: 'user@example.com' },
                role: { type: 'string', example: 'customer' }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
    @UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

    /**
     * ADMIN ENDPOINT - Protected with API Key
     * Example of X-API-KEY authentication
     */
    @ApiOperation({
        summary: 'Get system health (Admin only)',
        description: 'Returns system health information. Requires X-API-KEY header with "admin:health" permission.'
    })
    @ApiSecurity('api-key')
    @ApiResponse({
        status: 200,
        description: 'System health retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'healthy' },
                uptime: { type: 'number', example: 12345 },
                timestamp: { type: 'string', example: '2025-12-04T10:30:00Z' }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing API key' })
    @ApiResponse({ status: 403, description: 'Forbidden - API key does not have required permission' })
    @RequireApiKeyPermission('admin:health')
    @UseGuards(ApiKeyGuard)
    @Get('admin/health')
    getSystemHealth() {
        return {
            status: 'healthy',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            message: 'API Key authentication successful with admin:health permission'
        };
    }

    @ApiOperation({
        summary: 'Initiate Google OAuth login',
        description: 'Redirects to Google OAuth consent screen. User will be redirected back to callback URL after authentication.'
    })
    @ApiResponse({
        status: 302,
        description: 'Redirects to Google OAuth consent screen'
    })
    @UseGuards(GoogleOAuthGuard)
    @Get('google')
    async googleAuth() {
        // Guard redirects to Google
    }

    @ApiOperation({
        summary: 'Google OAuth callback',
        description: 'Handles the redirect from Google after user authentication. Returns JWT tokens for the authenticated user.'
    })
    @ApiResponse({
        status: 200,
        description: 'User authenticated successfully via Google OAuth',
        schema: {
            type: 'object',
            properties: {
                accessToken: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    description: 'Access token (valid for 1 hour)'
                },
                refreshToken: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    description: 'Refresh token (valid for 7 days)'
                },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                        email: { type: 'string', example: 'user@gmail.com' },
                        username: { type: 'string', example: 'John Doe' },
                        provider: { type: 'string', example: 'google' }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Google authentication failed' })
    @UseGuards(GoogleOAuthGuard)
    @Get('google/callback')
    async googleAuthCallback(@Request() req, @Res() res: Response) {
        const result = await this.authService.validateGoogleUser(req.user);
        
        // Redirect to frontend with tokens in query params (or use a different strategy)
        // For now, return JSON response
        return res.json({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            user: {
                id: result.user.id,
                email: result.user.email,
                username: result.user.username,
                provider: result.user.provider
            }
        });
    }

}


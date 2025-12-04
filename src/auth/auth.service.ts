import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) { }
 
    async registerUser(username: string, email: string, password: string, role?: string): Promise<{ accessToken: string; refreshToken: string }> {
        const existingUser = await this.userService.findByEmail(email);
        if (existingUser) {
            throw new UnauthorizedException('User already exists');
        }

        const newUser = await this.userService.create({ username, email, password, role } as CreateUserDto);
        
        // Payload del JWT incluye el nombre del rol para facilitar validaciones
        const payload = { 
            sub: newUser.id, 
            email: newUser.email, 
            role: newUser.role.name  // ← Enviamos el nombre del rol ('admin', 'customer', etc)
        };
        
        // AccessToken: 1 hora para uso normal
        const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '1h' });
        
        // RefreshToken: 7 días para renovar el accessToken
        const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' });
        
        return { accessToken, refreshToken };
    }

    async signIn(email: string, pass: string): Promise<{ accessToken: string; refreshToken: string }> {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        
        const isValidPassword = await bcrypt.compare(pass, user.password);
        if (!isValidPassword) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { 
            sub: user.id, 
            email: user.email, 
            role: user.role.name  // ← Enviamos el nombre del rol
        };

        const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '1h' });
        const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' });
        
        return { accessToken, refreshToken };
    }

    async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: process.env.JWT_SECRET
            });
            const newPayload = { sub: payload.sub, email: payload.email, role: payload.role };
            const accessToken = await this.jwtService.signAsync(newPayload, { expiresIn: '1h' });

            return { accessToken };
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }
    }

    // Validates or creates user from Google OAuth profile
    async validateGoogleUser(googleProfile: any): Promise<{ accessToken: string; refreshToken: string; user: any }> {
        const { googleId, email, firstName, lastName } = googleProfile;

        // Check if user already exists
        let user = await this.userService.findByEmail(email);

        if (!user) {
            // Create new user from Google profile
            user = await this.userService.createGoogleUser({
                email,
                username: `${firstName}${lastName}`.toLowerCase(),
                googleId,
                provider: 'google',
            });
        } else if (!user.googleId) {
            user = await this.userService.updateGoogleId(user.id, googleId);
        }

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role.name,
        };

        const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '1h' });
        const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' });

        return { accessToken, refreshToken, user };
    }
}
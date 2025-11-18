import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Injectable()
export class AuthService {
    constructor(private userService: UserService,
        private jwtService: JwtService) { }
 
    async registerUser(email: string, password: string, role: string): Promise<{ accessToken: string }> {
        const existingUser = await this.userService.findByEmail(email);
        if (existingUser) {
            throw new UnauthorizedException('User already exists');
        }

        const newUser = await this.userService.create({ email, password, role } as CreateUserDto);
        const payload = { sub: newUser.id, email: newUser.email, role: newUser.role };
        return {
            accessToken: await this.jwtService.signAsync(payload)
        };
    }

    async signIn(email: string, pass: string): Promise<{ accessToken: string }> {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        
        const isValidPassword = await bcrypt.compare(pass, user.password);
        if (!isValidPassword) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
            accessToken: await this.jwtService.signAsync(payload)
        };
    }
}
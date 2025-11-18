import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    return user;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    return {
      message: 'Login exitoso',
      access_token: accessToken,
      refresh_token: refreshToken,
      user,
    };
  }

  async refreshToken(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    return { access_token: accessToken };
  }

  async register(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await this.usersService.create({
      ...data,
      password: hashedPassword,
    });

    console.log("newUser recibido:", newUser);
    const user = Array.isArray(newUser) ? newUser[0] : newUser;

    const payload = { sub: user.id, email: user.email, role: user.role };

    const token = await this.jwtService.signAsync(payload);

    return {
      message: 'Usuario registrado correctamente',
      user,
      access_token: token,
    };
  }
}

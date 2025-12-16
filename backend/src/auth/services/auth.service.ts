import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../users/services/users.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { User } from '../../users/entities/users.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string; access_token: string }> {
    const {
      username,
      email,
      password,
      confirmPassword,
      phoneNumber,
      birthDate,
    } = registerDto;

    // ensure passwords match
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // check for existing user with same email
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // create user (password will be hashed in usersService.create)
    const user: Partial<User> = {
      username,
      email,
      password, // pass plain password, let usersService handle hashing
      phoneNumber,
      birthDate: birthDate ? new Date(birthDate) : undefined, // convert string to Date since birthDate is Date inside User entity
    };

    try {
      // create new user
      const createdUser = await this.usersService.create(user);

      // create JWT token for the new user
      const payload = {
        sub: (createdUser as any)._id,
        email: createdUser.email,
        role: createdUser.role,
      };

      const access_token = await this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: parseInt(
          this.configService.get<string>('JWT_EXPIRES_IN') || '3600',
        ),
      });

      return { message: 'User registered successfully', access_token };
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  }

  // Validate credentials and return JWT token
  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const { email, password } = loginDto;

    // find user by email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // create and sign JWT token
    const payload = {
      sub: (user as any)._id,
      email: user.email,
      role: user.role,
    };
    const access_token = await this.jwtService.signAsync(payload);
    // , {
    //   secret: this.configService.get<string>('JWT_SECRET'),
    //   expiresIn: parseInt(
    //     this.configService.get<string>('JWT_EXPIRES_IN') || '3600',
    //   ),
    // }

    return { access_token };
  }



  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    return user;
  }

  //decodeToken : utility to decode a JWT token
  async decodeToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
  async findUserByEmail(email: string): Promise<User | null> {
    return this.usersService.findByEmail(email);
  }
}

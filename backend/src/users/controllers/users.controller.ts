import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/enums/roles.enum';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ADMIN create new user manually
  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateUserDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    return await this.usersService.create(dto);
  }

  // get all users with optional search/filter (only admin)
  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(@Query('search') search?: string) {
    if (search) {
      return this.usersService.searchByUsernameOrEmail(search);
    }
    return await this.usersService.findAll();
  }

  // Get current user info
  @Get('me')
  async getMe(@Req() req) {
    const user = await this.usersService.findById(req.user.id);
    const { password, ...rest } = user;
    return rest;
  }

  // Get a specific user by ID (only admin)
  @Get(':id')
  @Roles(UserRole.ADMIN)
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    const { password, ...rest } = user;
    return rest;
  }

  // Update own profile
  @Patch('me')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, callback) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, unique + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(new Error('Only JPG/PNG images allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async updateMe(
    @Req() req,
    @Body() dto: UpdateUserDto,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    if ((dto as any).role) delete (dto as any).role; // users can't change role
    if (dto.password && dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // if user uploaded an avatar, set path
    if (avatar) {
      dto.avatar = `/uploads/avatars/${avatar.filename}`;
    }

    const updatedUser = await this.usersService.update(req.user.id, dto);
    const { password, ...rest } = updatedUser;
    return rest;
  }

  // Update any user by ID (only admin)
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    if (dto.password && dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const updatedUser = await this.usersService.update(id, dto);
    const { password, ...rest } = updatedUser;
    return rest;
  }

  // Delete user by ID (only admin)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string, @Req() req) {
    const currentUser = req.user;
    return await this.usersService.remove(id, currentUser);
  }
}
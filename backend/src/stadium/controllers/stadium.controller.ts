/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
  Req,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { StadiumService } from '../services/stadium.service';
import { CreateStadiumDto } from '../dto/create-stadium.dto';
import { UpdateStadiumDto } from '../dto/update-stadium.dto';
import { QueryStadiumDto } from '../dto/query-stadium.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/auth/enums/roles.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('stadium')
export class StadiumController {
  constructor(private readonly stadiumService: StadiumService) {}

  // ================= Create a stadium =================
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Req() _req: any, @Body() createStadiumDto: CreateStadiumDto) {
    try {
      return await this.stadiumService.create(createStadiumDto);
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to create stadium');
    }
  }

  // ================= Get stadiums (paginated + filters) =================
  @Get()
  async findAll(@Query() query: QueryStadiumDto) {
    // Returns: { data: Stadium[], meta: { total, page, limit, totalPages, hasNext, hasPrev } }
    return this.stadiumService.findAllPaginated(query);
  }

  // ================= Get a single stadium by ID =================
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.stadiumService.findOne(id);
  }

  // ================= Update a stadium =================
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateStadiumDto: UpdateStadiumDto) {
    try {
      return await this.stadiumService.update(id, updateStadiumDto);
    } catch (error) {
      // surface NotFound/BadRequest from service
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to update stadium');
    }
  }

  // ================= Delete a stadium =================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.stadiumService.delete(id);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ReservationsService } from '../services/reservations.service';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { UpdateReservationDto } from '../dto/update-reservation.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/auth/enums/roles.enum';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  // CREATE a new reservation (any logged user)
  @Post()
  async create(@Body() dto: CreateReservationDto, @Req() req) {
    // Automatically assign organizer to the connected user
    return this.reservationsService.create({
      ...dto,
      organizer: req.user._id,
    });
  }

  // GET all reservations (Admin only)
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll() {
    return this.reservationsService.findAll();
  }

  // GET all reservations for a specific user (user or Admin)
  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string, @Req() req) {
    // Allow access only if the current user matches or is admin
    if (req.user.role !== UserRole.ADMIN && req.user._id.toString() !== userId) {
      throw new ForbiddenException('You can only view your own reservations.');
    }

    return this.reservationsService.findByUser(userId);
  }

  // GET one reservation by ID (Organizer, Player, or Admin)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    const reservation = await this.reservationsService.findOne(id);

    const userId = req.user._id.toString();
    const isOrganizer = reservation.organizer._id.toString() === userId;
    const isPlayer = reservation.players.some(
      (p: any) => p._id.toString() === userId,
    );
    const isAdmin = req.user.role === UserRole.ADMIN;

    if (!isOrganizer && !isPlayer && !isAdmin) {
      throw new ForbiddenException(
        'You are not allowed to view this reservation.',
      );
    }

    return reservation;
  }

  // UPDATE reservation (Organizer or Admin)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateReservationDto,
    @Req() req,
  ) {
    const reservation = await this.reservationsService.findOne(id);

    const userId = req.user._id.toString();
    const isOrganizer = reservation.organizer._id.toString() === userId;
    const isAdmin = req.user.role === UserRole.ADMIN;

    if (!isOrganizer && !isAdmin) {
      throw new ForbiddenException(
        'Only the organizer or admin can edit this reservation.',
      );
    }

    return this.reservationsService.update(id, dto);
  }

  // UPDATE status (Admin only or automated payment system)
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.reservationsService.updateStatus(id, status);
  }

  // DELETE reservation (Organizer or Admin)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    const reservation = await this.reservationsService.findOne(id);

    const userId = req.user._id.toString();
    const isOrganizer = reservation.organizer._id.toString() === userId;
    const isAdmin = req.user.role === UserRole.ADMIN;

    if (!isOrganizer && !isAdmin) {
      throw new ForbiddenException(
        'Only the organizer or admin can delete this reservation.',
      );
    }

    return this.reservationsService.remove(id);
  }
}

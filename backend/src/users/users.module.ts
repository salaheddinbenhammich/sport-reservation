import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { User, UserSchema } from './entities/users.entity';
import { Reservation, ReservationSchema } from 'src/reservations/entities/reservations.entity';

@Module({
  imports: [
    // Register the User schema with Mongoose
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Reservation.name, schema: ReservationSchema },
    ]),
  ],
  controllers: [UsersController], // Optional, only if you want user-specific routes
  providers: [UsersService], // Required for AuthService to inject UsersService
  exports: [UsersService], // Export to allow AuthModule to use UsersService
})
export class UsersModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StadiumModule } from './stadium/stadium.module';
import { SessionModule } from './session/session.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { ReservationsModule } from './reservations/reservations.module';
import { PaymentsModule } from './payments/payments.module';
import { EmailModule } from './email/email.module';
import { TestEmailController } from './test-email.controller';
//import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    // Load .env globally
    ConfigModule.forRoot({ isGlobal: true }),

    // MongoDB connection using ConfigService
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),

    AuthModule,
    UsersModule,
    HealthModule,
    StadiumModule,
    SessionModule,
    ReservationsModule,
    PaymentsModule,
    EmailModule,
    //ReviewsModule,
    //PlayerListModule,
  ],
  controllers: [AppController, TestEmailController],
  providers: [AppService],
})
export class AppModule {}

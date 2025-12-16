import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionController } from './controllers/session.controller';
import { SessionService } from './services/session.service';
import { Session, SessionSchema } from './entities/session.entity'; // Import your entity

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
  ],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [MongooseModule, SessionService],
})
export class SessionModule {}

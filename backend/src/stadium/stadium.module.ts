import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StadiumController } from './controllers/stadium.controller';
import { StadiumService } from './services/stadium.service';
import { Stadium, StadiumSchema } from './entities/stadium.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: Stadium.name, schema: StadiumSchema }])],
  controllers: [StadiumController],
  providers: [StadiumService],
})
export class StadiumModule {}

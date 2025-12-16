import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose/dist/common/mongoose.decorators';
import { Connection, ConnectionStates } from 'mongoose';

@Controller('api')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}
  @Get('health')
  getHealth() {
    // mongoose connection readyState: 0=disconnected,1=connected,2=connecting,3=disconnecting
    const state = this.connection.readyState;
    return {
      db: state === ConnectionStates.connected ? 'ok' : 'down',
      readyState: state,
    };
  }
}

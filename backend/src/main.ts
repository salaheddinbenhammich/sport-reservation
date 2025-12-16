import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { join } from 'path/win32';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  // to tell Nest we’re using Express so we can use useStaticAssets
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // we added this request logger to help diagnose routing issues
  app.use((req: any, res: any, next: () => void) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.debug('Incoming HTTP', req.method, req.url);
    next();
  });

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        console.error('🧩 Validation errors:', errors);
        return new BadRequestException(errors);
      },
    }),
  );

  // serve static files (uploaded avatars)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Enable CORS for frontend communication
  app.enableCors({
    origin: '*', // Frontend URL
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error('Failed to bootstrap application', err);
  process.exit(1);
});

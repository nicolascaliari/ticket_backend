import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { envs } from './config/envs';
import { ValidationPipe } from '@nestjs/common';

async function main() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'https://tickets-ncaliari.vercel.app'
    ],
    credentials: true,
  });



  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.setGlobalPrefix('api');

  await app.listen(envs.port);
}
main();

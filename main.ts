import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import dotenv from "dotenv";

async function bootstrap() {


  const app = await NestFactory.create(AppModule);
  app.enableCors();
  dotenv.config();
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

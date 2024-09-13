import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailVerificationService } from './email-verification/email-verification.service';
import { EmailVerificationController } from './email-verification/email-verification.controller';

@Module({
  imports: [],
  controllers: [AppController,EmailVerificationController],
  providers: [AppService,EmailVerificationService],
})
export class AppModule {}

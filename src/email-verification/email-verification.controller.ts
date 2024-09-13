import { Controller, Get, Query } from '@nestjs/common';
import { EmailVerificationService } from './email-verification.service';

@Controller('email-verification')
export class EmailVerificationController {
  constructor(private readonly emailVerificationService: EmailVerificationService) {}

  @Get('verify')
  async verifyEmail(@Query('email') email: string): Promise<string> {
    return this.emailVerificationService.verifyEmail(email);
  }
}

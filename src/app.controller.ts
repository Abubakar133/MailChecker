import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  getDefaultRoute() {
    return 'Server is running successfully!';
  }
  @Get()
  getDefaultRoute2() {
    return 'Server is running successfully!';
  }
  @Get()
  getHello(){
    return this.appService.getHello();
  }
}

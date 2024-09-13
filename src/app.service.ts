import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return { name :'Hi I am Abubakar'};
  }
}

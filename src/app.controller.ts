// ** NestJs
import { Controller, Get } from '@nestjs/common';
import { Public, ResponseMessage } from './decorator/customize';

@Controller()
export class AppController {
  @Public()
  @Get('re-call')
  @ResponseMessage('API re call render')
  reCall() {
    return 'Hello World!';
  }
}

// ** NestJs
import { Module } from '@nestjs/common';

// ** Services
import { UploadTelegramService } from './upload-telegram.service';

// ** Controllers
import { UploadTelegramController } from './upload-telegram.controller';

@Module({
  controllers: [UploadTelegramController],
  providers: [UploadTelegramService]
})
export class UploadTelegramModule {}

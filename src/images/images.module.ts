// ** NestJs
import { Module } from '@nestjs/common';

// ** Services
import { ImagesService } from './images.service';
import { UploadTelegramService } from '../upload-telegram/upload-telegram.service';

// ** Controllers
import { ImagesController } from './images.controller';

// ** Mongoose
import { MongooseModule } from '@nestjs/mongoose';

// ** Schemas
import { Image, ImageSchema } from './schemas/image.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Image.name, schema: ImageSchema }]),
  ],
  controllers: [ImagesController],
  providers: [ImagesService, UploadTelegramService],
})
export class ImagesModule {}

// ** NestJs
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

// ** Services
import { UploadTelegramService } from './upload-telegram.service';

// ** Multer
import { memoryStorage } from 'multer';

// ** Decorators
import { ResponseMessage } from '../decorator/customize';

@Controller('upload-telegram')
export class UploadTelegramController {
  constructor(private readonly uploadTelegramService: UploadTelegramService) {}

  @Post('upload')
  @ResponseMessage('Upload image successful')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Only images allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadOne(
    @UploadedFile() file: Express.Multer.File,
    @Body('caption') caption: string,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.uploadTelegramService.sendPhotoByBuffer(
      file.buffer,
      file.originalname,
      caption,
    );
  }

  @Post('upload-multiple')
  @ResponseMessage('Upload multi image successful')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Only images allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadMany(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('caption') caption: string,
  ) {
    if (!files || files.length === 0)
      throw new BadRequestException('No files uploaded');
    return this.uploadTelegramService.sendPhotosByBuffers(files, caption);
  }
}

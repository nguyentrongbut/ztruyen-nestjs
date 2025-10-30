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

// ** Messages
import { UPLOAD_MESSAGES } from '../configs/messages/upload.message';

@Controller('upload-telegram')
export class UploadTelegramController {
  constructor(private readonly uploadTelegramService: UploadTelegramService) {}

  private fileFilter = (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp',
      'image/tiff',
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      return cb(
        new BadRequestException(
          `Chỉ chấp nhận file: ${allowedMimes.join(', ')}`,
        ),
        false,
      );
    }
    cb(null, true);
  };

  @Post('upload')
  @ResponseMessage(UPLOAD_MESSAGES.UPLOAD_SINGLE_SUCCESS)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException(UPLOAD_MESSAGES.ONLY_IMAGES_ALLOWED),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body('caption') caption: string,
  ) {
    if (!file) {
      throw new BadRequestException(UPLOAD_MESSAGES.NO_FILE_UPLOADED);
    }
    return this.uploadTelegramService.sendDocumentByBuffer(
      file.buffer,
      file.originalname,
      caption,
    );
  }

  @Post('upload-multiple')
  @ResponseMessage(UPLOAD_MESSAGES.UPLOAD_MULTIPLE_SUCCESS)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException(UPLOAD_MESSAGES.ONLY_IMAGES_ALLOWED),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadManyDocuments(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('caption') caption: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException(UPLOAD_MESSAGES.NO_FILES_UPLOADED);
    }
    return this.uploadTelegramService.sendDocumentsByBuffers(files, caption);
  }
}

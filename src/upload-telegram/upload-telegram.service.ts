// ** NestJs
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// ** Axios
import axios, { AxiosResponse } from 'axios';

// ** Stream
import { Readable } from 'stream';

// ** FormData
import FormData from 'form-data';

// ** Slugify
import slugify from 'slugify';

// ** Messages
import { UPLOAD_MESSAGES } from '../configs/messages/upload.message';

@Injectable()
export class UploadTelegramService {
  private readonly token: string;
  private readonly chatId: string;

  constructor(private readonly configService: ConfigService) {
    this.token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    this.chatId = this.configService.get<string>('TELEGRAM_CHAT_ID');
  }

  private apiUrl(method: string) {
    return `https://api.telegram.org/bot${this.token}/${method}`;
  }

  async getFilePath(fileId: string): Promise<string> {
    try {
      const res = await axios.get(this.apiUrl(`getFile?file_id=${fileId}`));
      if (!res.data.ok) {
        throw new NotFoundException(UPLOAD_MESSAGES.FILE_NOT_FOUND);
      }
      return res.data.result.file_path;
    } catch (error) {
      throw new NotFoundException(UPLOAD_MESSAGES.FETCH_FILE_ERROR);
    }
  }

  async getFileStream(fileId: string): Promise<Readable> {
    const filePath = await this.getFilePath(fileId);
    const url = `https://api.telegram.org/file/bot${this.token}/${filePath}`;

    try {
      const response: AxiosResponse<Readable> = await axios.get(url, {
        responseType: 'stream',
      });
      return response.data;
    } catch (error) {
      throw new NotFoundException(
        UPLOAD_MESSAGES.STREAM_FILE_ERROR
      );
    }
  }

  async sendPhotoByBuffer(
    fileBuffer: Buffer,
    filename = 'image.jpg',
    caption: string,
  ) {
    if (!caption) throw new BadRequestException(UPLOAD_MESSAGES.CAPTION_REQUIRED);

    const form = new FormData();
    form.append('chat_id', this.chatId);
    form.append('photo', fileBuffer, { filename });
    if (caption) form.append('caption', caption);

    const res = await axios.post(this.apiUrl('sendPhoto'), form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    if (!res.data.ok) throw new Error(UPLOAD_MESSAGES.UPLOAD_FAILED);

    const fileId = res.data.result.photo.pop().file_id;
    const slug = slugify(caption, { lower: true });

    return { fileId, slug };
  }

  async sendPhotosByBuffers(files: Express.Multer.File[], caption: string) {
    if (!caption) throw new BadRequestException(UPLOAD_MESSAGES.CAPTION_REQUIRED);
    const form = new FormData();
    const media: any[] = [];

    files.forEach((file, i) => {
      media.push({
        type: 'photo',
        media: `attach://photo${i}`,
        caption: i === 0 && caption ? caption : undefined,
      });
      form.append(`photo${i}`, file.buffer, { filename: file.originalname });
    });

    form.append('chat_id', this.chatId);
    form.append('media', JSON.stringify(media));

    const res = await axios.post(this.apiUrl('sendMediaGroup'), form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    if (!res.data.ok) throw new Error(UPLOAD_MESSAGES.UPLOAD_FAILED);
    const fields = res.data.result.map((msg, i) => ({
      fileId: msg.photo.pop().file_id,
      slug: slugify(`${caption}-${i + 1}`, { lower: true }),
    }));

    return { fields };
  }
}

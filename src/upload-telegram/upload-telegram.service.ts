// ** NestJs
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// ** Axios
import axios from 'axios';

// ** FormData
import FormData from 'form-data';

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

  private fileUrl(filePath: string) {
    return `https://api.telegram.org/file/bot${this.token}/${filePath}`;
  }

  private async getFileUrl(fileId: string): Promise<string> {
    const res = await axios.get(this.apiUrl(`getFile?file_id=${fileId}`));
    if (!res.data.ok) {
      throw new Error(`getFile failed: ${JSON.stringify(res.data)}`);
    }
    return this.fileUrl(res.data.result.file_path);
  }

  async sendPhotoByBuffer(
    fileBuffer: Buffer,
    filename = 'image.jpg',
    caption?: string,
  ) {
    const form = new FormData();
    form.append('chat_id', this.chatId);
    form.append('photo', fileBuffer, { filename });
    if (caption) form.append('caption', caption);

    const res = await axios.post(this.apiUrl('sendPhoto'), form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    if (!res.data.ok) throw new Error('Upload failed');

    const fileId = res.data.result.photo.pop().file_id;
    const url = await this.getFileUrl(fileId);
    return { url };
  }

  async sendPhotosByBuffers(files: Express.Multer.File[], caption?: string) {
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

    if (!res.data.ok) throw new Error('Upload failed');

    const urls = await Promise.all(
      res.data.result.map(async (msg) => {
        const fileId = msg.photo.pop().file_id;
        return this.getFileUrl(fileId);
      }),
    );

    return { urls };
  }
}

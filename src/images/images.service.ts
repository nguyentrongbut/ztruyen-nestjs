// ** NestJs
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

// ** Express
import { Response } from 'express';

// ** Mongoose
import { Model } from 'mongoose';

// ** Services
import { UploadTelegramService } from '../upload-telegram/upload-telegram.service';

// ** Schemas
import { Image, ImageDocument } from './schemas/image.schema';

@Injectable()
export class ImagesService {
  constructor(
    @InjectModel(Image.name) private imageModel: Model<ImageDocument>,
    private readonly uploadTelegramService: UploadTelegramService,
  ) {}

  async findImage(slug: string, res: Response) {
    const image = await this.imageModel.findOne({ slug });
    if (!image) throw new NotFoundException('Image not found');

    const stream = await this.uploadTelegramService.getFileStream(image.fileId);

    // cache
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    stream.pipe(res);
  }

  async create(fileId: string, slug: string) {
    const isExist = await this.imageModel.findOne({ slug });
    if (isExist) {
      throw new BadRequestException('Slug already exists');
    }
    const newImage = await this.imageModel.create({
      fileId,
      slug,
    });

    return newImage;
  }

  async createMany(fields: { fileId: string; slug: string }[]) {
    if (!fields || fields.length === 0) {
      throw new BadRequestException('No fields provided');
    }

    // Filter out invalid entries
    const docsToInsert = fields
      .filter((f) => f.fileId && f.slug)
      .map((f) => ({ fileId: f.fileId, slug: f.slug }));

    // insertMany
    const insertedDocs = await this.imageModel.insertMany(docsToInsert, {
      ordered: false,
    });

    return {
      success: true,
      createdCount: insertedDocs.length,
      images: insertedDocs.map((d) => ({ fileId: d.fileId, slug: d.slug })),
    };
  }

  async remove(slug: string) {
    const image = await this.imageModel.findOne({ slug });
    if (!image) {
      throw new NotFoundException(`Image with slug "${slug}" not found`);
    }

    await this.imageModel.deleteOne({ slug });
    return { success: true, slug };
  }

  async removeMany(slugs: string[]) {
    if (!slugs || slugs.length === 0) {
      throw new BadRequestException('No slugs provided');
    }

    const images = await this.imageModel.find({ slug: { $in: slugs } });
    if (!images || images.length === 0) {
      throw new NotFoundException('No images found for the given slugs');
    }

    const result = await this.imageModel.deleteMany({ slug: { $in: slugs } });

    return {
      success: true,
      deletedCount: result.deletedCount,
      slugs: images.map((img) => img.slug),
    };
  }
}

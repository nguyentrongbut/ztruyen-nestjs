// ** NestJs
import { Controller, Get, Param, Res } from '@nestjs/common';

// ** Express
import { Response } from 'express';

// ** Services
import { ImagesService } from './images.service';

// ** Decorator
import { Public } from '../decorator/customize';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Public()
  @Get('/:type/:slug')
  findImage(@Param('slug') slug: string, @Res() res: Response) {
    return this.imagesService.findImage(slug, res);
  }
}

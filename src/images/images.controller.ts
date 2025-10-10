// ** NestJs
import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Req,
  Res,
} from '@nestjs/common';

// ** Express
import { Response, Request } from 'express';

// ** Services
import { ImagesService } from './images.service';

// ** Decorator
import { Public, ResponseMessage } from '../decorator/customize';

// ** Message
import { IMAGE_MESSAGES } from '../configs/messages/image.message';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Public()
  @Get('/:type/:slug')
  @ResponseMessage(IMAGE_MESSAGES.FETCH_SUCCESS)
  findImage(
    @Param('slug') slug: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const referer = req.get('referer');
    const allowedOrigins = ['http://localhost:3000'];

    // Check referer
    if (
      !referer ||
      !allowedOrigins.some((origin) => referer.startsWith(origin))
    ) {
      throw new ForbiddenException(IMAGE_MESSAGES.ACCESS_FORBIDDEN);
    }

    return this.imagesService.findImage(slug, res);
  }
}

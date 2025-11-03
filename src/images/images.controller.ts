// ** NestJs
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

// ** Express
import { Response, Request } from 'express';

// ** Services
import { ImagesService } from './images.service';

// ** Decorator
import { Public, ResponseMessage } from '../decorator/customize';

// ** Message
import { IMAGE_MESSAGES } from '../configs/messages/image.message';

// ** Guards
import { RolesGuard } from '../guards/roles.guard';

@Controller('images')
@UseGuards(RolesGuard)
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
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];

    // Check referer
    if (
      !referer ||
      !allowedOrigins.some((origin) => referer.startsWith(origin))
    ) {
      throw new ForbiddenException(IMAGE_MESSAGES.ACCESS_FORBIDDEN);
    }

    return this.imagesService.findImage(slug, res);
  }

  @Delete('/:slug')
  @ResponseMessage(IMAGE_MESSAGES.DELETE_SUCCESS)
  async remove(@Param('slug') slug: string) {
    return this.imagesService.remove(slug);
  }

  @Delete()
  @ResponseMessage(IMAGE_MESSAGES.DELETE_MANY_SUCCESS)
  async removeMany(@Body('slugs') slugs: string[]) {
    return this.imagesService.removeMany(slugs);
  }
}

// ** NestJs
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// ** Controller
import { AppController } from './app.controller';

// ** Service
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

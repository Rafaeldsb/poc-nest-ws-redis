import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PixGateway } from './pix.gateway';

@Module({
  imports: [
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'views'),
    //   exclude: ['/api*'],
    // }),
  ],
  controllers: [AppController],
  providers: [AppService, PixGateway],
})
export class AppModule {}

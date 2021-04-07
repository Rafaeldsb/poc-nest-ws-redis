import { Body, Controller, Get, Param } from '@nestjs/common';
import IORedis from 'ioredis';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private redis: IORedis.Redis;

  constructor(private readonly appService: AppService) {
    this.redis = new IORedis({
      password: 'poc',
      host: 'redis',
    });
  }

  @Get('/txid/:txid')
  public getPix(@Param('txid') txid) {
    // return {
    //   status: 'pending'
    // };
    return this.redis.hget(`txid:${txid}`, 'status').then((status) => ({
      status,
    }));
  }
}

import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from '@nestjs/websockets';
import IORedis from 'ioredis';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, finalize, map, tap } from 'rxjs/operators';

@WebSocketGateway()
export class PixGateway {
  private redis: IORedis.Redis;
  private messages: BehaviorSubject<any>;

  constructor() {
    this.redis = new IORedis({
      password: 'poc',
      host: 'redis',
    });
    this.messages = new BehaviorSubject(null);
    this.redis.psubscribe('txid:*').then(() => {
      console.log('subscribed');
      this.redis.on('pmessage', (pattern, channel) => {
        console.log(pattern, channel);
        this.messages.next(channel);
      });
    });
  }

  @SubscribeMessage('pix')
  pixGenerated(@MessageBody() data: any): Observable<WsResponse<unknown>> {
    console.log(data);
    return this.messages.pipe(
      filter((message) => message === `txid:${data.txid}`),
      map((message) => ({
        event: 'pix',
        data: message,
      })),
      tap((message) => console.log(1, message)),
      finalize(() => console.log('end')),
    );
  }
}

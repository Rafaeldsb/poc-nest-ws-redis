import { Logger } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
  WebSocketServer,
} from '@nestjs/websockets';
import IORedis from 'ioredis';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { delay, filter, finalize, map, tap } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class PixGateway {
  @WebSocketServer() server: Server;

  private redisSub: IORedis.Redis;
  private redis: IORedis.Redis;
  private messages: BehaviorSubject<any>;
  private logger: Logger = new Logger('AppGateway');

  constructor() {
    this.redis = new IORedis({
      password: 'poc',
      host: 'redis',
    });
    this.redisSub = new IORedis({
      password: 'poc',
      host: 'redis',
    });
    this.messages = new BehaviorSubject(null);
    this.redisSub.psubscribe('txid:*').then(() => {
      console.log('subscribed');
      this.redisSub.on('pmessage', (pattern, channel) => {
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

  @SubscribeMessage('pix-mock')
  pixMock(): Observable<WsResponse<unknown>> {
    return from(
      this.redis.hget(`txid:123456`, 'status').then((status) => ({
        status,
      })),
    ).pipe(
      map((status) => ({
        event: 'pix',
        data: { status },
      })),
      delay(1000 * 60)
    );
  }
}

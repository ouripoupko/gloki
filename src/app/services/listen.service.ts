import { Injectable } from '@angular/core';
import { AgentService } from '../agent.service';
import { firstValueFrom, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ListenService {

  reconnectInterval = 0;
  subscribers: {[key: string]: {[key: string]: (content: any)=>Observable<void>}} = {};
  eventSource?: EventSource;

  constructor(
    private agentService: AgentService
  ) { }

  register(contract: string, action: string, target: (content: any) => Observable<void>) {
    this.subscribers[contract] = {...this.subscribers[contract], [action]: target};
  }

  listen() {
    this.reconnectInterval = 10000;
    this.eventSource?.close();
    this.eventSource = this.agentService.listen();
    this.eventSource.addEventListener('message', async message => {
      if(message.data.length > 0) {
        let content = JSON.parse(message.data)
        console.log('listen', content, this.subscribers, content.contract, content.action);
        await firstValueFrom(this.subscribers['']?.[content.action]?.(content) || of(null));
        await firstValueFrom(this.subscribers[content.contract]?.[content.action]?.(content) || of(null));
      }
    });
    this.eventSource.addEventListener('open', open => {
      console.log('open', open);
      this.reconnectInterval = 0;
    });
    this.eventSource.addEventListener('error', error => {
      console.log('error', error);
      setTimeout(() => {
        this.listen();
      }, this.reconnectInterval);
    });
  }
}

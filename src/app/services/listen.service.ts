import { Injectable } from '@angular/core';
import { AgentService } from '../agent.service';

@Injectable({
  providedIn: 'root'
})
export class ListenService {

  reconnectInterval = 0;
  subscribers: {[key: string]: {[key: string]: ()=>void}} = {};
  eventSource?: EventSource;

  constructor(
    private agentService: AgentService
  ) { }

  subscribe(contract: string, action: string, target: () => void) {
    this.subscribers[contract] = {...this.subscribers[contract], [action]: target};
  }

  listen() {
    this.reconnectInterval = 10000;
    this.eventSource?.close;
    this.eventSource = this.agentService.listen(Object.keys(this.subscribers));
    this.eventSource.addEventListener('message', message => {
      if(message.data.length > 0) {
        let content = JSON.parse(message.data)
        console.log('listen', content);
        this.subscribers[content.contract]?.[content.action]?.();
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

import { Injectable } from '@angular/core';
import { AgentService } from '../agent.service';
import { Contract, Invite, Method } from '../contract';
import { concatMap, map, of, tap } from 'rxjs';
import { ProfileService } from './profile.service';
import { CommunityService } from './community.service';
import { DeliberationService } from './deliberation.service';
import { ListenService } from './listen.service';

@Injectable({
  providedIn: 'root'
})
export class GlokiService {

  agentExists: boolean = false;

  constructor(
    private agentService: AgentService,
    private profileService: ProfileService,
    private communityService: CommunityService,
    private deliberationService: DeliberationService,
    private listenService: ListenService
  ) { }

  setServer(server: string, agent: string) {
    this.agentService.setServer(server, agent)
    return this.agentService.isExistAgent().pipe(
      tap((reply: any) => {
        if(reply) this.agentExists = true;
      })
    );
  }

  connect() {
    return this.agentService.registerAgent().pipe(
      tap(_ => {
        this.agentExists = true;
      })
    );
  }

  login() {
    return this.agentService.getContracts().pipe(
      concatMap((contracts: Contract[]) => {
        return this.profileService.initialize(contracts).pipe(
          concatMap(_ => {
            if (this.profileService.contract) {
              this.communityService.initialize(contracts, this.profileService.contract);
              this.deliberationService.initialize(contracts, this.profileService.contract);
              return of(null);
            } else {
              return this.profileService.deployProfileContract();
            }
          })
        );
      }),
      map(_ => {
        this.listenService.subscribe('', 'deploy_contract', this.loginUpdate.bind(this));
        this.listenService.subscribe('', 'a2a_reply_join', this.loginUpdate.bind(this));
        this.listenService.subscribe('', 'a2a_connect', this.loginUpdate.bind(this));
        this.listenService.listen();
      })
    );
  }

  loginUpdate(message: any) {
    console.log('loginUpdate', message)
    this.login().subscribe()
  }


  getInvite(id: string) {
    if (!(id in this.communityService.communities)) return "invalid invitation";
    return JSON.stringify({
      server: this.agentService.server,
      agent: this.agentService.agent,
      contract: id,
      name: this.communityService.communities[id].contract.name
    } as Invite);
  }

  read(id: string, methodName: string, params = {}) {
    if (!id) return of(null);
    let method = {} as Method;
    method.name = methodName;
    method.values = params;
    return this.agentService.read(id, method);
  }

  write(id: string, methodName: string, params = {}) {
    if (!id) return of(null);
    let method = {} as Method;
    method.name = methodName;
    method.values = params;
    return this.agentService.write(id, method);
  }
}

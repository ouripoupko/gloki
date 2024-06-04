import { Injectable } from '@angular/core';
import { AgentService } from '../agent.service';
import { Contract, Invite, Method } from '../contract';
import { concatMap, map, of } from 'rxjs';
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
    return this.agentService.isExistAgent();
  }

  connect() {
    return this.agentService.registerAgent()
  }

  login() {
    return this.agentService.getContracts().pipe(
      concatMap((contracts: Contract[]) => {
        this.profileService.initialize(contracts);
        if (this.profileService.contract) {
          this.communityService.initialize(contracts, this.profileService.contract);
          this.deliberationService.initialize(contracts, this.profileService.contract);
          return of();
        } else {
          return this.profileService.deployProfileContract();
        }
      }),
      map(_ => {
        this.listenService.subscribe('', 'deploy_contract', this.login.bind(this));
        this.listenService.subscribe('', 'a2a_reply_join', this.login.bind(this));
        this.listenService.subscribe('', 'a2a_connect', this.login.bind(this));
        this.listenService.listen();
      })
    );
  }



  // joinDelib(community: string) {
  //   if (community in this.communityDeliberation && this.profileContract) {
  //     const communityContract = this.communityContracts[community];
  //     const delibId = this.communityDeliberation[community];
  //     this.agentService.joinContract(this.server, this.agent, communityContract.address,
  //       communityContract.pid, delibId, this.profileContract).subscribe();
  //   }

  // }



  getInvite(id: string) {
    if (!(id in this.communityService.communities)) return "invalid invitation";
    return JSON.stringify({
      server: this.agentService.server,
      agent: this.agentService.agent,
      contract: id,
      name: this.communityService.communities[id].contract.name
    } as Invite);
  }

  // parseInvite(invite: string) {
  //   try {
  //     let result = {} as Invite;
  //     let json = JSON.parse(invite);
  //     result.server = json.server;
  //     result.agent = json.agent;
  //     result.contract = json.contract;
  //     result.name = json.name;
  //     if (strNotEmpty(result.server) && strNotEmpty(result.agent) && strNotEmpty(result.contract) && strNotEmpty(result.name)) {
  //       return result
  //     }
  //   } catch {
  //   }

  //   return undefined;
  // }

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

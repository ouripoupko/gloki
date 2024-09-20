import { Injectable } from '@angular/core';
import { AgentService } from '../agent.service';
import { Contract, Method } from '../contract';
import { concatMap, of, tap } from 'rxjs';
import { ProfileService } from './profile.service';
import { CommunityService } from './community.service';
import { DeliberationService } from './deliberation.service';
import { ListenService } from './listen.service';
import { UtilService } from './util.service';

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
    private listenService: ListenService,
    private utilService: UtilService
  ) { }

  setServer(server: string, agent: string) {
    this.communityService.clear();
    this.deliberationService.clear();
    this.listenService.clear();
    this.profileService.clear();
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
    this.listenService.register('', 'deploy_contract', _ => this.readContracts());
    this.listenService.register('', 'a2a_reply_join', _ => this.readContracts());
    this.listenService.register('', 'a2a_connect', _ => this.readContracts());
    this.listenService.listen();
    return this.readContracts();
  }

  readContracts() {
    return this.agentService.getContracts().pipe(
      concatMap((contracts: Contract[]) => {
        return this.profileService.initialize(contracts).pipe(
          tap(_ => {
            if (this.profileService.contract) {
              this.communityService.initialize(contracts, this.profileService.contract);
              this.deliberationService.initialize(contracts, this.profileService.contract);
            } else {
              this.profileService.deployProfileContract();
            }
          })
        );
      })
    );
  }


  getInvite(id: string) {
    if (!(id in this.communityService.communities)) return "invalid invitation";
    const s = this.utilService.stringToInt8Array(this.agentService.server);
    const a = this.utilService.hexToInt8Array(this.agentService.agent);
    const c = this.utilService.hexToInt8Array(id);
    const n = this.utilService.stringToInt8Array(this.communityService.communities[id].contract.name);
    const lengths = new Int8Array([s.length, a.length, c.length, n.length]);
    const all = this.utilService.concatInt8Arrays([lengths, s, a, c, n]);
    return this.utilService.int8ArrayToString(all, 'latin1');
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

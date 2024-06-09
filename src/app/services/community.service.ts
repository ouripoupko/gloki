import { Injectable } from '@angular/core';
import { AgentService } from '../agent.service';
import { Contract, Invite, Method } from '../contract';
import { CommonService } from './common.service';
import { ListenService } from './listen.service';
import { ProfileService } from './profile.service';
import { ReplaySubject, concatMap, map, of, tap } from 'rxjs';
import { DeliberationService } from './deliberation.service';

const COMMUNITY_FILE_NAME = 'gloki_community.py';

export interface Community {
  contract: Contract;
  tasks: any;
  members: any;
  nominates: any;
  properties: any;
  notifier: ReplaySubject<void>;
}

@Injectable({
  providedIn: 'root'
})
export class CommunityService {

  communities: {[key: string]: Community} = {}

  constructor(
    private agentService: AgentService,
    private commonService: CommonService,
    private listenService: ListenService,
    private profileService: ProfileService,
    private deliberationService: DeliberationService
  ) { }

  initialize(contracts: Contract[], profile: string) {
    // find communities
    for (let contract of contracts) {
      if (contract.contract === COMMUNITY_FILE_NAME) {
        this.commonService.isContractUsesProfile(contract.id, profile).subscribe((reply) => {
          if (reply) {
            this.communities[contract.id] = { contract: contract, notifier: new ReplaySubject<void>(1)} as Community;
            this.readCommunity(contract.id);
            this.listenService.subscribe(contract.id, 'contract_write', (content: any)=>{
              console.log('community listener', content);
              this.readCommunity(contract.id);
            })
          }
        });
      }
    }
    console.log('finished building communities', this.communities);
  }

  deployCommunity(name: string, instructions: string) {
    if (!this.profileService.contract) return of();
    return this.commonService.deployContract(name, COMMUNITY_FILE_NAME, this.profileService.contract, {}).pipe(
      concatMap(contract => {
        let method = {} as Method;
        method.name = 'set_instructions';
        method.values = {'instructions': instructions};
        return this.agentService.write(contract, method).pipe(
          map(_ => contract)
        );
      }),
      concatMap(contract => {
        return this.deliberationService.deployDelib(name, contract);
      })
    );
  }

  joinCommunity(invite: Invite) {
    if (!this.profileService.contract) return of();

    return this.agentService.joinContract(invite.server,
      invite.agent, invite.contract, this.profileService.contract);
  }

  readCommunity(communityId: string) {
    let method = {} as Method;
    method.name = 'get_all';
    method.values = {};
    this.agentService.read(communityId, method).subscribe((community: Community) => {
      Object.assign(this.communities[communityId], community);
      this.communities[communityId].notifier.next();
    });
  }

}

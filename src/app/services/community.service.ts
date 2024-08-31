import { Injectable } from '@angular/core';
import { AgentService } from '../agent.service';
import { Contract, Invite, Method } from '../contract';
import { CommonService } from './common.service';
import { ListenService } from './listen.service';
import { ProfileService } from './profile.service';
import { ReplaySubject, concatMap, map, of, tap } from 'rxjs';
import { DeliberationService } from './deliberation.service';
import { MatDialog } from '@angular/material/dialog';
import { AuthenticateComponent } from '../dialogs/authenticate/authenticate.component';

const COMMUNITY_FILE_NAME = 'gloki_community.py';

export interface Community {
  contract: Contract;
  tasks: {[key: string]: boolean};
  members: {[key: string]: string[]};
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
    private deliberationService: DeliberationService,
    public dialog: MatDialog
  ) { }

  initialize(contracts: Contract[], profile: string) {
    // find communities
    for (let contract of contracts) {
      if (contract.contract === COMMUNITY_FILE_NAME) {
        this.commonService.isContractUsesProfile(contract.id, profile).subscribe((reply) => {
          if (reply) {
            if (!(contract.id in this.communities)) {
              this.communities[contract.id] = { contract: contract, notifier: new ReplaySubject<void>(1)} as Community;
            }
            this.readCommunity(contract.id);
            this.profileService.readOthers(reply);
            this.listenService.register(contract.id, 'contract_write', (content: any)=>{
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

  authenticate(agent: string, community?: Community) {
    if(community) {
      const dialogRef = this.dialog.open(AuthenticateComponent, {
        panelClass: 'authenticate-box',
        backdropClass: 'dialog-backdrop',
        data: {
          instructions: community?.properties['instructions'],
          profile: this.profileService.others[agent]
        }
      });
      dialogRef.afterClosed().subscribe(didApprove => {
        if (didApprove !== undefined && community?.contract) {
          let method = {} as Method;
          method.name = didApprove ? 'approve' : 'disapprove';
          method.values = didApprove ? {'approved': agent} : {'disapproved': agent};
          this.agentService.write(community.contract.id, method).subscribe();
        }
      });
    }
  }

}

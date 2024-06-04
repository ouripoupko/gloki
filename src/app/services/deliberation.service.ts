import { Injectable } from '@angular/core';
import { Contract, Method } from '../contract';
import { CommonService } from './common.service';
import { ProfileService } from './profile.service';
import { concatMap, of } from 'rxjs';
import { AgentService } from '../agent.service';

const DELIB_FILE_NAME = 'gloki_delib.py';

@Injectable({
  providedIn: 'root'
})
export class DeliberationService {

  deliberations: any = {};

  constructor(
    private agentService: AgentService,
    private commonService: CommonService,
    private profileService: ProfileService
  ) { }

  initialize(contracts: Contract[], profile: string) {
    // find deliberations
    for (let contract of contracts) {
      if (contract.contract === DELIB_FILE_NAME) {
        this.commonService.isContractUsesProfile(contract.id, profile).subscribe((reply) => {
          if (reply) {
            this.deliberations[contract.id] = { contract: contract };
            this.readDeliberation(contract.id);
          }
        });
      }
    }
  }

  deployDelib(name: string, community: string) {
    console.log('deploy deliberation', name, community);
    if (!this.profileService.contract) return of();
    return this.commonService.deployContract(name, DELIB_FILE_NAME, this.profileService.contract, {community: community}).pipe(
      concatMap(contract => {
        let method = {} as Method;
        method.name = 'set_property';
        method.values = {'key': 'deliberation', 'value': contract};
        return this.agentService.write(community, method);
      })  
    );
  }

  readDeliberation(contract: string) {

  }

}

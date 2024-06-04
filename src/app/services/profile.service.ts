import { Injectable } from '@angular/core';
import { Contract, Method } from '../contract';
import { CommonService } from './common.service';
import { tap } from 'rxjs/operators';
import { AgentService } from '../agent.service';
import { of } from 'rxjs';
import { ListenService } from './listen.service';

const PROFILE_CONTRACT_NAME = 'unique-gloki-profile';
const PROFILE_FILE_NAME = 'profile.py'

function strNotEmpty(str?: string): boolean {
  return str !== undefined && str !== null && str.trim() !== '';
}

export interface Profile {
  first_name: string;
  last_name: string;
  image_url: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  contract?: string;
  profile: Profile = {} as Profile;

  constructor(
    private agentService: AgentService,
    private commonService: CommonService,
    private listenService: ListenService
  ) { }

  initialize(contracts: Contract[]) {
    // find profile
    for (let contract of contracts) {
      if (contract.name === PROFILE_CONTRACT_NAME) {
        this.contract = contract.id;
        this.readProfile();
        this.listenService.subscribe(this.contract, 'contract_write', ()=>{this.readProfile()});
      }
    }
  }

  deployProfileContract() {
    return this.commonService.deployContract(PROFILE_CONTRACT_NAME, PROFILE_FILE_NAME, "", {}).pipe(
      tap(reply => {
        this.contract = reply;
        this.listenService.subscribe(this.contract, 'contract_write', ()=>{this.readProfile()});
      })
    );
  }

  readProfile() {
    if (!this.contract) return;
    let method = {} as Method;
    method.name = 'get_profile';
    method.values = {};
    return this.agentService.read(this.contract, method).subscribe((profile) => {
      if(profile) {
        this.profile = profile as Profile;
      }
    });
  }

  writeProfile() {
    if (!this.contract) return of(null);
    let method = {} as Method;
    method.name = 'set_values';
    method.values = {'items': this.profile};
    return this.agentService.write(this.contract, method).pipe(
      tap((reply)=> {console.log('write contract', reply);})
    );
  }

  isProfileFull() {
    return (
      strNotEmpty(this.profile?.first_name) &&
      strNotEmpty(this.profile?.last_name) &&
      strNotEmpty(this.profile?.image_url) );
  }

}

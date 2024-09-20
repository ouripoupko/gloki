import { Injectable } from '@angular/core';
import { Contract, Method, Partner } from '../contract';
import { CommonService } from './common.service';
import { AgentService } from '../agent.service';
import { of, tap } from 'rxjs';
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
  others: {[key: string]: Profile} = {};

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
        return this.readProfile().pipe(
          tap(_ => {
            if(this.contract) {
              this.listenService.register(this.contract, 'contract_write', _ => this.readProfile());
            }
          })
        );
      }
    }
    return of(null);
  }

  clear() {
    this.contract = undefined;
    this.profile = {} as Profile;
  }

  deployProfileContract() {
    this.commonService.deployContract(PROFILE_CONTRACT_NAME, PROFILE_FILE_NAME, "", {}).subscribe(reply => {
      this.contract = reply;
      this.listenService.register(this.contract, 'contract_write', _ => this.readProfile());
    });
  }

  readProfile() {
    if (!this.contract) return of(null);
    let method = {} as Method;
    method.name = 'get_profile';
    method.values = {};
    return this.agentService.read(this.contract, method).pipe(
      tap((profile) => {
        if(profile) {
          Object.assign(this.profile, profile);
        }
      })
    );
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

  readOthers (partners: Partner[]) {
    for (let partner of partners) {
      this.others[partner.agent] = {} as Profile;
      let method = {} as Method;
      method.name = 'get_profile';
      method.values = {};
      this.agentService.readRemote(partner.address, partner.agent, partner.profile, method).subscribe((profile => {
        if(profile) {
          Object.assign(this.others[partner.agent], profile);
        }
      }));
    }
  }
}

import { Injectable } from '@angular/core';
import { AgentService } from './agent.service';
import { Contract, Method, Profile } from './contract';
import { Observable, concat, concatAll, concatMap, endWith, map, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const PROFILE_CONTRACT_NAME = 'unique-gloki-profile';

function strNotEmpty(str?: string): boolean {
  return str !== undefined && str !== null && str.trim() !== '';
} 

@Injectable({
  providedIn: 'root'
})
export class GlokiService {

  agent: string = '';
  server: string = '';
  agentExists: boolean = false;
  communityContracts: Contract[] = [];
  profileContract?: string;
  profile: Profile = {} as Profile;

  constructor(
    private agentService: AgentService,
    private httpClient: HttpClient,
  ) { }

  setServer(server: string, key: string) {
    this.agent = key;
    this.server = server;
    this.communityContracts = [];
    this.profileContract = undefined;
    return this.agentService.isExistAgent(this.server, this.agent).pipe(
      tap((reply) => {
        this.agentExists = reply.valueOf();
        console.log('agent exists:', this.agentExists, reply);
      }),
      concatMap(this.getContractsIfExists.bind(this))
    )
  }

  getContractsIfExists(isExist: Boolean) {
    if (this.agentExists) {
      return this.agentService.getContracts(this.server, this.agent).pipe(
        tap(this.processContracts.bind(this)),
        map(_ => { return (this.profileContract ? true : false); })
      );
    }
    return of(false);
  }

  processContracts(contracts: Contract[]) {
    for (let contract of contracts) {
      if (contract.name === PROFILE_CONTRACT_NAME) {
        this.profileContract = contract.id;
        console.log('profile found:', this.profileContract);
      }
      console.log('contract file', contract.contract);
      console.log('contract profile', contract.profile);
      if (contract.contract === 'community.py' && contract.profile === this.profileContract) {
        this.communityContracts.push(contract);
      }
    }
    console.log('communities', this.communityContracts);
  }

  connect() {
    let registerAgent = this.agentExists ? of('') : this.agentService.registerAgent(this.server, this.agent).pipe(
      tap(reply => {
        console.log('register agent', reply);
      })
    );

    let deployContract = strNotEmpty(this.profileContract) ? of(null) : this.deployProfileContract();

    return concat(registerAgent, deployContract);
  }

  deployProfileContract() {
    return this.deployContract(PROFILE_CONTRACT_NAME, "profile.py", "", "");
  }

  deployCommunity(name: string, description: string) {
    if (!this.profileContract) return of('');
    return this.deployContract(name, "community.py", this.profileContract, "");
  }

  deployContract(name: string, file_name: string, profile: string, community: string){
    let contract = {} as Contract;

    contract.name = name;
    contract.contract = file_name;
    contract.code = "";
    contract.protocol = "BFT";
    contract.default_app = "";
    contract.pid = this.agent;
    contract.address = this.server;

    contract.profile = profile;

    contract.constructor = {};

    return this.httpClient.get(`assets/${contract.contract}`, { responseType: 'text' }).pipe(
      concatMap((data) => {
        contract.code = data;
        return this.agentService.addContract(this.server, this.agent, contract).pipe(
          tap(reply => {console.log('deplloy contract', reply);})
        );
      })
    );
  }

  readProfile() {
    if (!this.profileContract) return of(null);
    let method = {} as Method;
    method.name = 'get_profile';
    method.values = {};
    return this.agentService.read(this.server, this.agent, this.profileContract, method).pipe(
      tap((profile) => {
        if(profile) {
          this.profile = profile as Profile;
          console.log('read profile', this.profile);
        }
      })
    );
  }

  writeProfile() {
    if (!this.profileContract) return of(null);
    let method = {} as Method;
    method.name = 'set_values';
    method.values = {'items': this.profile};
    return this.agentService.write(this.server, this.agent, this.profileContract, method).pipe(
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

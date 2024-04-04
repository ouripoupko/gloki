import { Injectable } from '@angular/core';
import { AgentService } from './agent.service';
import { Contract, Method, Profile } from './contract';
import { concat, concatMap, firstValueFrom, map, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const PROFILE_CONTRACT_NAME = 'unique-gloki-profile';

@Injectable({
  providedIn: 'root'
})
export class GlokiService {

  agent: string = '';
  server: string = '';
  agentExists: boolean = false;
  contracts?: Contract[];
  profileContract?: string;
  profile?: Profile;

  constructor(
    private agentService: AgentService,
    private httpClient: HttpClient,
  ) { }

  setServer(server: string, key: string) {
    this.agent = key;
    this.server = server;
    this.contracts = undefined;
    this.profileContract = undefined;
    return this.agentService.isExistAgent(this.server, this.agent).pipe(
      tap((reply) => {
        this.agentExists = reply.valueOf();
        console.log('agent exists:', this.agentExists);
      }),
      concatMap(this.getContractsIfExists.bind(this))
    )
  }

  getContractsIfExists(isExist: Boolean) {
    if (this.agentExists) {
      return this.agentService.getContracts(this.server, this.agent).pipe(
        tap((contracts) => {
          this.contracts = contracts
          console.log('read contracts');
        }),
        tap(this.checkContractsForProfile.bind(this)),
        map(_ => { return (this.profileContract ? true : false); })
      );
    }
    return of(false);
  }

  checkContractsForProfile(contracts: Contract[]) {
    for (let contract of contracts) {
      if (contract.name === PROFILE_CONTRACT_NAME) {
        this.profileContract = contract.id;
        console.log('profile found:', this.profileContract);
      }
    }
  }

  connect() {
    let observables = [];
    if (!this.agentExists) observables.push(this.agentService.registerAgent(this.server, this.agent));
    if (!this.profileContract) observables.push(this.deployProfileContract());
    return concat(observables);
  }

  deployProfileContract() {
    let contract = {} as Contract;

    contract.name = PROFILE_CONTRACT_NAME;
    contract.contract = "profile.py";
    contract.code = "";
    contract.protocol = "BFT";
    contract.default_app = "";
    contract.pid = this.agent;
    contract.address = this.server;

    contract.profile = "";

    contract.constructor = {};

    return this.httpClient.get(`assets/${contract.contract}`, { responseType: 'text' }).pipe(
      concatMap((data) => {
        contract.code = data;
        return this.agentService.addContract(this.server, this.agent, contract);
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
    return this.agentService.write(this.server, this.agent, this.profileContract, method);
  }

  isProfileFull() {
    return (
      this.profile?.first_name &&
      this.profile?.last_name &&
      this.profile?.image_url );
  }
}

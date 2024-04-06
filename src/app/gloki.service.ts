import { Injectable } from '@angular/core';
import { AgentService } from './agent.service';
import { Contract, Method, Partner, Profile } from './contract';
import { concat, concatMap, map, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const PROFILE_CONTRACT_NAME = 'unique-gloki-profile';

export interface Invite {
  server: string;
  agent: string;
  contract: string;
  name: string;
}

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
  communityContracts: {[key: string]: Contract} = {};
  profileContract?: string;
  profile: Profile = {} as Profile;

  constructor(
    private agentService: AgentService,
    private httpClient: HttpClient,
  ) { }

  setServer(server: string, key: string) {
    this.agent = key;
    this.server = server;
    this.communityContracts = {};
    this.profileContract = undefined;
    return this.agentService.isExistAgent(this.server, this.agent).pipe(
      tap((reply) => {
        this.agentExists = reply.valueOf();
        console.log('agent exists:', this.agentExists, reply);
      }),
      concatMap(_ => {return this.getContractsIfExists();})
    )
  }

  getContractsIfExists() {
    console.log('getContractsIfExists', this.agentExists);
    this.communityContracts = {};
    if (this.agentExists) {
      return this.agentService.getContracts(this.server, this.agent).pipe(
        tap(this.processContracts.bind(this)),
        map(_ => { return (this.profileContract ? true : false); })
      );
    }
    return of(false);
  }

  processContracts(contracts: Contract[]) {

    // find profile
    for (let contract of contracts) {
      if (contract.name === PROFILE_CONTRACT_NAME) {
        this.profileContract = contract.id;
        console.log('profile found:', this.profileContract);
      }
    }

    // find communities
    for (let contract of contracts) {
      if (contract.contract === 'community.py') {
        let partners_method = { name: 'get_partners', values: {}} as Method;
        this.agentService.read(this.server, this.agent, contract.id, partners_method)
          .subscribe((reply) => {
            reply.forEach((partner: Partner) => {
              if (partner.agent === this.agent && partner.profile === this.profileContract) {
                this.communityContracts[contract.id] = contract;
              }
            });
          })
        }
    }
    console.log('communities', this.communityContracts);
  }

  connect() {
    let registerAgent = this.agentExists ? of('') : this.agentService.registerAgent(this.server, this.agent).pipe(
      tap(reply => {
        console.log('register agent', reply);
        this.agentExists = true;
      })
    );

    let deployContract = strNotEmpty(this.profileContract) ? of(null) : this.deployProfileContract();

    return concat(registerAgent, deployContract);
  }

  deployProfileContract() {
    return this.deployContract(PROFILE_CONTRACT_NAME, "profile.py", "", "").pipe(
      tap(reply => {this.profileContract = reply;})
    );
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

  login() {
    this.agentService.listen(this.server, this.agent).addEventListener('message', message => {
      if(message.data.length > 0) {
        let content = JSON.parse(message.data)
        console.log('listen', content);
        if (content.action == "deploy_contract")
          this.getContractsIfExists().subscribe();
      }
    });
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

  getInvite(id: string) {
    if (!(id in this.communityContracts)) return "invalid invitation";
    return JSON.stringify({
      server: this.server,
      agent: this.agent,
      contract: id,
      name: this.communityContracts[id].name
    } as Invite);
  }

  parseInvite(invite: string) {
    try {
      let result = {} as Invite;
      let json = JSON.parse(invite);
      result.server = json.server;
      result.agent = json.agent;
      result.contract = json.contract;
      result.name = json.name;
      if (strNotEmpty(result.server) && strNotEmpty(result.agent) && strNotEmpty(result.contract) && strNotEmpty(result.name)) {
        return result
      }
    } catch {
    }

    return undefined;
  }

  joinCommunity(invite: Invite) {
    if (!this.profileContract) return of(null);

    return this.agentService.joinContract(this.server, this.agent, invite.server,
      invite.agent, invite.contract, this.profileContract);
  }
}

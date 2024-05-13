import { Injectable } from '@angular/core';
import { AgentService } from '../agent.service';
import { Contract, Method, Partner, Profile } from '../contract';
import { concat, concatMap, map, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Community } from './community';

const PROFILE_CONTRACT_NAME = 'unique-gloki-profile';
const PROFILE_FILE_NAME = 'profile.py'
const COMMUNITY_FILE_NAME = 'gloki_community.py';
const DELIB_FILE_NAME = 'gloki_delib.py';

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
  delibContracts: {[key: string]: Contract} = {};
  profileContract?: string;
  profile: Profile = {} as Profile;
  eventSource?: EventSource;
  communityDeliberation: {[key: string]: string} = {};
  reconnectInterval = 0;

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
    if (this.agentExists) {
      return this.agentService.getContracts(this.server, this.agent).pipe(
        tap(this.classifyContracts.bind(this)),
        map(_ => { return (this.profileContract ? true : false); })
      );
    }
    return of(false);
  }

  classifyContracts(contracts: Contract[]) {
    this.communityContracts = {};

    // find profile
    for (let contract of contracts) {
      if (contract.name === PROFILE_CONTRACT_NAME) {
        this.profileContract = contract.id;
        console.log('profile found:', this.profileContract);
      }
    }

    // find communities
    for (let contract of contracts) {
      if (contract.contract === COMMUNITY_FILE_NAME || contract.contract === DELIB_FILE_NAME) {
        let partners_method = { name: 'get_partners', values: {}} as Method;
        this.agentService.read(this.server, this.agent, contract.id, partners_method).subscribe((reply) => {
          reply.forEach((partner: Partner) => {
            if (partner.agent === this.agent && partner.profile === this.profileContract) {
              if (contract.contract === COMMUNITY_FILE_NAME) {
                this.communityContracts[contract.id] = contract;
                this.findDeliberation(contract.id);
              } else if (contract.contract === DELIB_FILE_NAME) {
                this.delibContracts[contract.id] = contract;
              }
            }
          });
        })
      }
    }
  }

  findDeliberation(communityId: string) {
    if (this.profileContract) {
      let method = {} as Method;
      method.name = 'get_properties';
      method.values = {};
      this.agentService.read(this.server, this.agent, communityId, method).subscribe((properties) => {
        if(properties?.deliberation) {
          let delibId = properties.deliberation;
          this.communityDeliberation[communityId] = delibId;
        }
      });
    }
  }

  joinDelib(community: string) {
    if (community in this.communityDeliberation && this.profileContract) {
      const communityContract = this.communityContracts[community];
      const delibId = this.communityDeliberation[community];
      this.agentService.joinContract(this.server, this.agent, communityContract.address,
        communityContract.pid, delibId, this.profileContract).subscribe();
    }

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
    return this.deployContract(PROFILE_CONTRACT_NAME, PROFILE_FILE_NAME, "", {}).pipe(
      tap(reply => {this.profileContract = reply;})
    );
  }

  deployCommunity(name: string, instructions: string) {
    if (!this.profileContract) return of('');
    return this.deployContract(name, COMMUNITY_FILE_NAME, this.profileContract, {}).pipe(
      tap(reply => {
        let method = {} as Method;
        method.name = 'set_instructions';
        method.values = {'instructions': instructions};
        if(this.profileContract) {
          this.agentService.write(this.server, this.agent, reply, method).subscribe(_ => {
          });
        }  
        this.deployDelib(name, reply);
      })
    );
  }

  deployDelib(name: string, community: string) {
    console.log('deploy deliberation', name, community);
    if (!this.profileContract) return of('');
    return this.deployContract(name, DELIB_FILE_NAME, this.profileContract, {community: community}).subscribe((reply) => {
      let method = {} as Method;
      method.name = 'set_property';
      method.values = {'key': 'deliberation', 'value': reply};
      if(this.profileContract) {
        this.agentService.write(this.server, this.agent, community, method).subscribe(_ => {
        });
      }  
    });
  }

  deployContract(name: string, file_name: string, profile: string, ctor: any){
    let contract = {} as Contract;

    contract.name = name;
    contract.contract = file_name;
    contract.code = "";
    contract.protocol = "BFT";
    contract.default_app = "";
    contract.pid = this.agent;
    contract.address = this.server;

    contract.profile = profile;

    contract.constructor = ctor;

    return this.httpClient.get(`assets/${contract.contract}`, { responseType: 'text' }).pipe(
      concatMap((data) => {
        contract.code = data;
        return this.agentService.addContract(this.server, this.agent, contract).pipe(
        );
      })
    );
  }

  logES() {
    if(this.eventSource) {
      console.log('readyState', this.eventSource.readyState);
      console.log('url', this.eventSource.url);
      console.log('withCredentials', this.eventSource.withCredentials);
    } else {
      console.log('eventSource empty')
    }
  }

  listen() {
    this.reconnectInterval = 10000;
    this.eventSource = this.agentService.listen(this.server, this.agent);
    this.logES();
    this.eventSource.addEventListener('message', message => {
      if(message.data.length > 0) {
        let content = JSON.parse(message.data)
        console.log('listen', content);
        if (content.action == "deploy_contract" || content.action === "a2a_reply_join" || content.action === "a2a_connect") {
          this.getContractsIfExists().subscribe();
        }
      }
    });
    this.eventSource.addEventListener('open', open => {
      console.log('open', open);
      this.reconnectInterval = 0;
    });
    this.eventSource.addEventListener('error', error => {
      console.log('error', error);
      setTimeout(() => {
        this.eventSource?.close;
        this.listen();
      }, this.reconnectInterval);
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

  read(id: string, methodName: string, params = {}) {
    if (!id) return of(null);
    let method = {} as Method;
    method.name = methodName;
    method.values = params;
    return this.agentService.read(this.server, this.agent, id, method);
  }

  write(id: string, methodName: string, params = {}) {
    if (!id) return of(null);
    let method = {} as Method;
    method.name = methodName;
    method.values = params;
    return this.agentService.write(this.server, this.agent, id, method);
  }
}

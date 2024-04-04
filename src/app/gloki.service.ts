import { Injectable } from '@angular/core';
import { AgentService } from './agent.service';
import { Contract } from './contract';
import { firstValueFrom } from 'rxjs';
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
  profileContract?: String;

  constructor(
    private agentService: AgentService,
    private httpClient: HttpClient,
  ) { }

  setServer(key: string, server: string) {
    this.agent = key;
    this.server = server;
    this.contracts = undefined;
    this.profileContract = undefined;
    return new Promise<boolean>(async (resolve, reject) => {
      this.agentExists = (await firstValueFrom<Boolean>(this.agentService.isExistAgent(this.server, this.agent))).valueOf();
      console.log('agent exists:', this.agentExists);
      if (this.agentExists) {
        this.contracts = await firstValueFrom<Contract[]>(this.agentService.getContracts(this.server, this.agent));
        console.log('read contracts');
        for (let contract of this.contracts) {
          if (contract.name === PROFILE_CONTRACT_NAME) {
            this.profileContract = contract.id;
            console.log('profile found:', this.profileContract);
          }
        }
      }
      resolve(this.profileContract ? true : false);
    });
  }

  connect() {
    return new Promise<void>(async (resolve, reject) => {
      await firstValueFrom(this.agentService.registerAgent(this.server, this.agent));
      console.log('register agent');
      if (!this.profileContract) {
        await this.deployProfileContract();
      }
      resolve();
    });
  }

  async deployProfileContract() {
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

    let data = await firstValueFrom(this.httpClient.get(`assets/${contract.contract}`, { responseType: 'text' }));
    contract.code = data;
    this.profileContract = await firstValueFrom(this.agentService.addContract(this.server, this.agent, contract));
    console.log('profile deployed:', this.profileContract);
  }
}

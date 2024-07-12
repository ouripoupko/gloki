import { Injectable } from '@angular/core';
import { AgentService } from '../agent.service';
import { Contract, Method, Partner } from '../contract';
import { concatMap, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(
    private agentService: AgentService,
    private httpClient: HttpClient
  ) { }

  isContractUsesProfile(contract: string, profile: string) {
    let partners_method = { name: 'get_partners', values: {}} as Method;
    return this.agentService.read(contract, partners_method).pipe(
      map((reply) => reply.some((partner: Partner) => (
        partner.agent === this.agentService.agent && partner.profile === profile
      )) ? reply : null)
    );
  }

  deployContract(name: string, file_name: string, profile: string, ctor: any){
    let contract = {} as Contract;

    contract.name = name;
    contract.contract = file_name;
    contract.code = "";
    contract.protocol = "BFT";
    contract.default_app = "";
    contract.pid = this.agentService.agent;
    contract.address = this.agentService.server;

    contract.profile = profile;

    contract.constructor = ctor;

    return this.httpClient.get(`assets/${contract.contract}`, { responseType: 'text' }).pipe(
      concatMap((data: string) => {
        contract.code = data;
        return this.agentService.addContract(contract).pipe(
        );
      })
    );
  }

}

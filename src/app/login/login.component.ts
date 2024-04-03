import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AgentService } from '../agent.service';
import { Contract } from '../contract';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  key: string = '';
  step: number = 1;
  selectedServer: string = '';
  registerChecked: boolean = false;
  agentExists: boolean = false;
  profileName: string = 'gloki-main-contract';
  profileContract?: String;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private agentService: AgentService,
    private httpClient: HttpClient
  ) { }

  onFileSelected(event: any) {
    if(event.target.files.length > 0)
    {
      var reader = new FileReader();
      reader.onload = () => {
        var text = reader.result as string;
        var json = JSON.parse(text);
        this.key = json['public'];
        this.step = 2;
      };
      reader.readAsText(event.target.files[0]);
    }
  }

  onGenerate(event: any) {
    var pad = new Uint8Array(32);
    window.crypto.getRandomValues(pad);
    let publicKey = Array.from(pad, value => value.toString(16).padStart(2, '0')).join('');
    const pair = {'public': publicKey, 'private': 'This is not a real key pair. just a mockup.'};
    const blob = new Blob([JSON.stringify(pair, null, 2)], { type: "application/json",});
    var url = window.URL.createObjectURL(blob);
    var anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "my_key.json";
    anchor.click();
    window.URL.revokeObjectURL(url);
    this.key = publicKey;
    this.step = 2;
  }

  location(full: boolean) {
    return full ? location.origin : location.hostname + (location.port ? ' (' + location.port + ')' : '');
  }

  onServerSelected(event: any) {
    this.isLoading = true;
    this.agentService.isExistAgent(this.selectedServer, this.key).subscribe({
      next: (exists: Boolean) => {
        console.log('agent exists:', exists);
        this.agentExists = exists.valueOf();
        this.agentService.getContracts(this.selectedServer, this.key)
        .subscribe((contracts:Contract[]) => {
          for (let contract of contracts) {
            if (contract.name === this.profileName) {
              this.profileContract = contract.id;
            }
          }
          console.log('contract found:', this.profileContract);
          this.step = 3;
          this.isLoading = false;
        });
      },
      error: (e) => {}
    });
  }

  doLogin() {
    this.isLoading = true;
    if (this.agentExists) {
      this.checkContract();
    } else {
      this.agentService.registerAgent(this.selectedServer, this.key).subscribe((reply) => {
        console.log('register agent:', reply);
        this.checkContract()
      });
    }
  }

  checkContract() {
    if (this.profileContract) {
      this.navigate();
    } else {
      let contract = {} as Contract;

      contract.name = this.profileName;
      contract.contract = "profile.py";
      contract.code = "";
      contract.protocol = "BFT";
      contract.default_app = "";
      contract.pid = this.key;
      contract.address = this.selectedServer;

      contract.profile = "";

      contract.constructor = {};

      this.httpClient.get(`assets/${contract.contract}`, { responseType: 'text' })
        .subscribe(data => {
          contract.code = data;
          this.agentService.addContract(this.selectedServer, this.key, contract)
            .subscribe((id) => {
              console.log('register contract:', id);
              this.profileContract = id;
              this.navigate();
          });
      });

    }
  }

  navigate() {
    this.router.navigate(['main'], { queryParams: { server: this.selectedServer, agent: this.key, contract: this.profileContract}});
  }

}

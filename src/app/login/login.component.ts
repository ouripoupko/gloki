import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AgentService } from '../agent.service';

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

  constructor(
    private router: Router,
    private agentService: AgentService,
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
    this.agentService.isExistAgent(this.selectedServer, this.key).subscribe({
      next: (exists: Boolean) => {
        this.agentExists = exists.valueOf();
        this.step = 3;
      },
      error: (e) => {}
    });
  }

  navigate(server: string) {
    this.router.navigate(['main'], { queryParams: { server: server, agent: this.key}});
  }

}

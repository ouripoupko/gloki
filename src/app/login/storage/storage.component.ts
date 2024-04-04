import { Component } from '@angular/core';
import { StateService } from '../state.service';
import { GlokiService } from 'src/app/gloki.service';

@Component({
  selector: 'app-storage',
  templateUrl: './storage.component.html',
  styleUrl: './storage.component.scss'
})
export class StorageComponent {

  selectedServer: string = '';

  constructor (
    private state: StateService,
    private gloki: GlokiService,
  ) {}

  onServerSelected(event: any) {
    this.state.isLoading = true;
    this.gloki.setServer(this.selectedServer, this.state.key).then(result => {
      this.state.agentExists = result;
      this.state.step = result ? 4 : 3;
      this.state.isLoading = false;
    }).catch(error => {
      // Handle error
    });
  }

}

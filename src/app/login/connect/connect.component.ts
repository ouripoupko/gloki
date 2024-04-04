import { Component } from '@angular/core';
import { GlokiService } from 'src/app/gloki.service';
import { StateService } from '../state.service';

@Component({
  selector: 'app-connect',
  templateUrl: './connect.component.html',
  styleUrl: './connect.component.scss'
})
export class ConnectComponent {

  constructor (
    private gloki: GlokiService,
    private state: StateService
  ) {}

  onConnect(event: any) {
    this.state.isLoading = true;
    this.gloki.connect().subscribe(_ => {
      this.state.step = 4;
      this.state.isLoading = false;
    });
  }
}

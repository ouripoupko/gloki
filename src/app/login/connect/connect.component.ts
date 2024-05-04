import { Component } from '@angular/core';
import { GlokiService } from 'src/app/gloki.service';
import { StateService } from '../state.service';
import { MatDialog } from '@angular/material/dialog';
import { InfoComponent } from 'src/app/dialogs/info/info.component';

@Component({
  selector: 'app-connect',
  templateUrl: './connect.component.html',
  styleUrl: './connect.component.scss'
})
export class ConnectComponent {

  constructor (
    private gloki: GlokiService,
    private state: StateService,
    public dialog: MatDialog
  ) { }

  showInfo() {
    this.dialog.open(InfoComponent, {
      panelClass: 'info-box',
      backdropClass: 'dialog-backdrop',
      data: {
        header: 'Connect IBC',
        summary: 'Connect to register your gloKi on your IBC blockchain.',
        content: 'It seems there is no record of your gloKi on your IBC blockchain. Connect to register your gloKi on your IBC blockchain for the first time. You will only need to do it once.'
      }
    });
  }

  onConnect(event: any) {
    this.state.isLoading = true;
    this.gloki.connect().subscribe(_ => {
      this.state.step = 4;
      this.state.isLoading = false;
    });
  }
}

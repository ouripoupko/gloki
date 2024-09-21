import { Component } from '@angular/core';
import { StateService } from '../state.service';
import { MatDialog } from '@angular/material/dialog';
import { InfoComponent } from 'src/app/dialogs/info/info.component';
import { DialogListComponent } from 'src/app/dialogs/dialog-list/dialog-list.component';

@Component({
  selector: 'app-gloki',
  standalone: true,
  imports: [],
  templateUrl: './gloki.component.html',
  styleUrl: './gloki.component.scss'
})
export class GlokiComponent {

  // showInfo: boolean = false;
  
  constructor(
    private state: StateService,
    public dialog: MatDialog
  ) { }

  showInfo() {
    this.dialog.open(InfoComponent, {
      panelClass: 'info-box',
      backdropClass: 'dialog-backdrop',
      data: {
        header:'What is gloKi?',
        summary:'gloKi is a cryptographic key pair stored on your device',
        content: 'People with gloKi\'s verify each other to make sure there is only one gloKi per person and that only human\'s have them - laying the foundation for a trustworthy public square.'
      }
    });
  }

  onSelect(event: any) {
    let glokies: string[] = JSON.parse(localStorage.getItem('glokies') || '[]');
    const dialogRef = this.dialog.open(DialogListComponent, {
      panelClass: 'list-box',
      backdropClass: 'dialog-backdrop',
      data: glokies
    });
    dialogRef.afterClosed().subscribe(key => {
      if (key) {
        this.state.key = key;
        this.state.step = 2;
      }
    });
  }

  onGenerate(event: any) {
    var pad = new Uint8Array(32);
    window.crypto.getRandomValues(pad);
    let publicKey = Array.from(pad, value => value.toString(16).padStart(2, '0')).join('');
    let glokies: string[] = JSON.parse(localStorage.getItem('glokies') || '[]');
    glokies.push(publicKey);
    localStorage.setItem('glokies', JSON.stringify(glokies));
    const dialogRef = this.dialog.open(InfoComponent, {
      panelClass: 'info-box',
      backdropClass: 'dialog-backdrop',
      data: {
        header:'Here is your new gloKi',
        summary:'It is stored in your browser local storage',
        content: publicKey
      }
    });
    dialogRef.afterClosed().subscribe(_ => {
      this.state.key = publicKey;
      this.state.step = 2;
    });
  }
}

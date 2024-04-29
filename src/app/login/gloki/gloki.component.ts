import { Component } from '@angular/core';
import { StateService } from '../state.service';
import { MatDialog } from '@angular/material/dialog';
import { InfoComponent } from 'src/app/dialogs/info/info.component';

@Component({
  selector: 'app-gloki',
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

  onFileSelected(event: any) {
    if(event.target.files.length > 0)
    {
      var reader = new FileReader();
      reader.onload = () => {
        var text = reader.result as string;
        var json = JSON.parse(text);
        this.state.key = json['public'];
        this.state.step = 2;
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
    this.state.key = publicKey;
    this.state.step = 2;
  }

}

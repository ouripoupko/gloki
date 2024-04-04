import { Component } from '@angular/core';
import { StateService } from '../state.service';

@Component({
  selector: 'app-gloki',
  templateUrl: './gloki.component.html',
  styleUrl: './gloki.component.scss'
})
export class GlokiComponent {

  constructor(
    private state: StateService
  ) { }

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

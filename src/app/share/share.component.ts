import { Component } from '@angular/core';
import { Options } from 'ngx-qrcode-styling';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrl: './share.component.scss'
})
export class ShareComponent {
  message: string = "Have a lovely day";

  public config: Options = {
    width: 300,
    height: 300,
    data: "https://www.facebook.com/",
    // image: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
    // margin: 5,
    // dotsOptions: {
    //   color: "#1977f3",
    //   type: "dots"
    // },
    // backgroundOptions: {
    //   color: "#ffffff",
    // },
    // imageOptions: {
    //   crossOrigin: "anonymous",
    //   margin: 0
    // }
  };

  onChange(event: any, qrcode: any) {
    this.config.data = this.message;
    qrcode.update(this.config, {});
  }
}

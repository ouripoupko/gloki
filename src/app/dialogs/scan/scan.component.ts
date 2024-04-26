import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
//import { BarcodeFormat } from '@zxing/library';
import {
  ScannerQRCodeConfig,
  ScannerQRCodeResult,
  NgxScannerQrcodeComponent,
} from 'ngx-scanner-qrcode';
import { GlokiService, Invite } from 'src/app/gloki.service';

@Component({
  selector: 'app-scan',
  templateUrl: './scan.component.html',
  styleUrl: './scan.component.scss'
})
export class ScanComponent {

  showResults: boolean = false;
  result?: Invite;

  public config: ScannerQRCodeConfig = {
    constraints: {
      // video: {
      //   width: 400
      // },
    },
    // canvasStyles: [
    //   { /* layer */
    //     lineWidth: 1,
    //     fillStyle: '#00950685',
    //     strokeStyle: '#00950685',
    //   },
    //   { /* text */
    //     font: '17px serif',
    //     fillStyle: '#ff0000',
    //     strokeStyle: '#ff0000',
    //   }
    // ],
  };

  @ViewChild('action') action!: NgxScannerQrcodeComponent;
  @Output() resultEvent = new EventEmitter<Invite>();


  constructor (
    private gloki: GlokiService
  ) {}

  public onEvent(e: ScannerQRCodeResult[], action?: any): void {
    e && action && action.stop();
    this.result = this.gloki.parseInvite(e?.[0]?.value);
    console.log('result', this.result);
    this.showResults = true;
  }

  public handle(action: any, fn: string): void {
    const playDeviceFacingBack = (devices: any[]) => {
      // front camera or back camera check here!
      const device = devices.find(f => (/back|rear|environment/gi.test(f.label))); // Default Back Facing Camera
      action.playDevice(device ? device.deviceId : devices[0].deviceId);
    }

    if (fn === 'start') {
      action[fn](playDeviceFacingBack).subscribe((r: any) => console.log(fn, r), alert);
    } else {
      action[fn]().subscribe((r: any) => console.log(fn, r), alert);
    }
  }
}

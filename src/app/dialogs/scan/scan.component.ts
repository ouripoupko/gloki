import { CommonModule } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import {
  ScannerQRCodeConfig,
  ScannerQRCodeResult,
  NgxScannerQrcodeComponent,
  NgxScannerQrcodeModule,
} from 'ngx-scanner-qrcode';

@Component({
  selector: 'app-scan',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    NgxScannerQrcodeModule
  ],
  templateUrl: './scan.component.html',
  styleUrl: './scan.component.scss'
})
export class ScanComponent {

  showResults: boolean = false;
  result?: any;

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
  
  constructor (
    @Inject(MAT_DIALOG_DATA) public data: {
      testResult: (result: string) => boolean,
      resultHeader: string,
      resultStringify: (result: any) => string
    }
  ) {}

  public onEvent(e: ScannerQRCodeResult[], action?: any): void {
    e && action && action.stop();
    this.result = this.data.testResult(e?.[0]?.value);
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

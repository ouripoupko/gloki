import { AfterViewInit, Component, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { NgxQrcodeStylingComponent, NgxQrcodeStylingModule, Options } from 'ngx-qrcode-styling';
import { GlokiService } from 'src/app/services/gloki.service';

@Component({
  selector: 'app-share',
  standalone: true,
  imports: [
    MatDialogModule,
    NgxQrcodeStylingModule
  ],
  templateUrl: './share.component.html',
  styleUrl: './share.component.scss'
})
export class ShareComponent implements AfterViewInit {
  @ViewChild('qrcode', { static: false }) public qrcode!: NgxQrcodeStylingComponent;

  constructor (
    private gloki: GlokiService,
    @Inject(MAT_DIALOG_DATA) public data: {contractId: string}
  ) {}

  public config: Options = {
    width: 325,
    height: 325,
    data: 'invalid invitation',
    image: "assets/Key.svg",
    margin: 0,
    dotsOptions: {
      color: '#334160',
      type: 'rounded'
    },
    // backgroundOptions: {
    //   color: "#ffffff",
    // },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.4,
      margin: 6,
    },
    cornersSquareOptions: {
      type: 'dot',
      color: '#334160',
    },
    cornersDotOptions: {
      type: 'dot',
      color: '#334160',
    },
  };

  ngAfterViewInit(): void {
    this.config.data = this.gloki.getInvite(this.data.contractId);
    this.qrcode.update(this.config, {});
  }

  toggleShare(value: boolean) {
  }
}

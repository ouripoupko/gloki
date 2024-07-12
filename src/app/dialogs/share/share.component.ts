import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NgxQrcodeStylingComponent, Options } from 'ngx-qrcode-styling';
import { GlokiService } from 'src/app/services/gloki.service';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrl: './share.component.scss'
})
export class ShareComponent implements AfterViewInit {
  message: string = "Have a lovely day";
  @Output() toggleEvent = new EventEmitter<boolean>();
  @Input() contractId = '';
  @ViewChild('qrcode', { static: false }) public qrcode!: NgxQrcodeStylingComponent;

  constructor (
    private gloki: GlokiService
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
    this.config.data = this.gloki.getInvite(this.contractId);
    this.qrcode.update(this.config, {});
  }

  onChange(event: any, qrcode: any) {
    this.config.data = this.message;
    qrcode.update(this.config, {});
  }

  toggleShare(value: boolean) {
    this.toggleEvent.emit(value);
  }
}

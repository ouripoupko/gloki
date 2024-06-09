import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GlokiService } from 'src/app/services/gloki.service';

@Component({
  selector: 'app-unverified',
  templateUrl: './unverified.component.html',
  styleUrl: './unverified.component.scss'
})
export class UnverifiedComponent {

  @Input() communityId?: string;
  joinEnable = true;

  constructor (
    private gloki: GlokiService
  ) {}

  joinAuthentication(event: void) {
    if (!this.communityId) return;
    console.log('unverified', this.communityId);
    this.joinEnable = false;
    this.gloki.write(this.communityId, 'request_join').subscribe();
  }

}

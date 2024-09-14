import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Community, CommunityService } from 'src/app/services/community.service';
import { GlokiService } from 'src/app/services/gloki.service';

@Component({
  selector: 'app-unverified',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './unverified.component.html',
  styleUrl: './unverified.component.scss'
})
export class UnverifiedComponent implements OnInit {

  @Input() communityId?: string;
  joinEnable = true;
  isFirst = false;

  ngOnInit(): void {
    if(this.communityId) {
      this.isFirst = Object.keys(this.communityService.communities[this.communityId].members).length === 0;
    }
  }

  constructor (
    public communityService: CommunityService,
    private gloki: GlokiService
  ) {}

  joinAuthentication(event: void) {
    if (!this.communityId) return;
    console.log('unverified', this.communityId);
    this.joinEnable = false;
    this.gloki.write(this.communityId, 'request_join').subscribe();
  }

}

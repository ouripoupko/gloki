import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { CommunityService } from 'src/app/services/community.service';
import { GlokiService } from 'src/app/services/gloki.service';
import { ListenService } from 'src/app/services/listen.service';

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
  error?: string;

  ngOnInit(): void {
    if(this.communityId) {
      this.isFirst = Object.keys(this.communityService.communities[this.communityId].members).length === 0;
    }
  }

  constructor (
    public communityService: CommunityService,
    private gloki: GlokiService,
    private listenService: ListenService
  ) {}

  checkJoinReply(content: any) {
    this.listenService.unregisterRequest(content.request);
    if (content.reply === false) {
      this.error = 'The community is busy at the moment. Please try again later';
      this.joinEnable = true;
    }
    return of(undefined);
  }

  joinAuthentication(event: void) {
    if (!this.communityId) return;
    this.joinEnable = false;
    this.error = undefined;
    this.gloki.write(this.communityId, 'request_join').subscribe(reply => {
      this.listenService.registerRequest(reply, content => this.checkJoinReply(content))
    });
  }

}

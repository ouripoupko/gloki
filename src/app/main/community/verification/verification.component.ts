import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AgentService } from 'src/app/agent.service';
import { Method } from 'src/app/contract';
import { AuthenticateComponent } from 'src/app/dialogs/authenticate/authenticate.component';
import { Community, CommunityService } from 'src/app/services/community.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './verification.component.html',
  styleUrl: './verification.component.scss'
})
export class VerificationComponent implements OnInit {
  @Input() communityId?: string;
  community?: Community;

  constructor(
    public communityService: CommunityService,
    public profileService: ProfileService
  ) { }

  ngOnInit(): void {
    if(this.communityId) {
      this.community = this.communityService.communities[this.communityId];
      console.log('tasks', this.community.tasks)
    }
  }

  countVerified() {
    return this.community ? Object.values(this.community.tasks).filter(x => x).length : 0;
  }

}

import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Community, CommunityService } from 'src/app/services/community.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './members.component.html',
  styleUrl: './members.component.scss'
})
export class MembersComponent implements OnInit {
  @Input() communityId?: string;
  community?: Community;
  justClicked: {[key: string]: boolean} = {};

  constructor(
    public communityService: CommunityService,
    public profileService: ProfileService
  ) { }

  ngOnInit(): void {
    if(this.communityId) {
      this.community = this.communityService.communities[this.communityId];
    }
  }

  callAuthenticate(key: string) {
    this.justClicked[key] = true;
    this.communityService.authenticate(key, this.community);
  }
}

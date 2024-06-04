import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from 'src/app/services/profile.service';
import { CommunityService } from 'src/app/services/community.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {

  constructor (
    private profileService: ProfileService,
    public communityService: CommunityService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('ngOnInit list checking if profile exists');
    if (!this.profileService.isProfileFull()) {
      this.router.navigate(['main', 'profile'], {replaceUrl: true})
    }
  }
  
}

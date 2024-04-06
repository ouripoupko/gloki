import { Component, OnInit } from '@angular/core';
import { GlokiService, Invite } from '../gloki.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  isLoading: boolean = false;
  findMode: boolean = false;

  constructor (
    public gloki: GlokiService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('entering main', this.gloki.profileContract);
    if (!this.gloki.profileContract) {
      this.router.navigate(['login'])
    }
    console.log('profile', this.gloki.profile);
    this.isLoading = true;
    if (!this.gloki.isProfileFull()) {
      this.gloki.readProfile().subscribe(_ => {
        this.isLoading = false;
        if (!this.gloki.isProfileFull()) {
          this.router.navigate(['profile'])
        }
      });
    }
  }

  gotoCreate() {
    this.router.navigate(['create']);
  }

  
  toggleFindMode(mode: boolean): void {
    this.findMode = mode;
  }

  onJoin(invite: Invite) {
    this.findMode = false;
    this.gloki.joinCommunity(invite)?.subscribe();
  }

}

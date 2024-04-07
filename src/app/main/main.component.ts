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
  isWaitingForJoin: boolean = false;
  showTimerNum: boolean = true;
  countdown: number = 10;
  countdownInterval: any;
  timerMsg = 'This may take several seconds\nThank you for your patience';

  constructor (
    public gloki: GlokiService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.gloki.profileContract) {
      this.router.navigate(['login'])
    }
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
    if(!this.gloki.eventSource || this.gloki.eventSource.readyState == 2) {
      this.gloki.login();
    }

    this.isWaitingForJoin = true;
    this.startCountdown();

    const intervalId = setInterval(() => {
      // Check if the value equals 1
      let readyState = this.gloki.eventSource?.readyState;
      if (readyState == 1) {
        clearInterval(intervalId); // Stop the interval
        // Perform something when the value becomes good
        this.gloki.joinCommunity(invite)?.subscribe(() => {
          this.isWaitingForJoin = false;
          this.stopCountdown();
        });
      } else if (readyState != 0) {
        clearInterval(intervalId); // Stop the interval
        this.stopCountdown();
        this.timerMsg = 'Oops! Something went wrong';
        console.log('failed to listen to server. gave up on joining community')
      }
    }, 100);
  }

  startCountdown() {
    this.countdown = 10;
    this.countdownInterval = setInterval(() => {
      this.countdown -= 0.1;
      this.countdown = Math.round(this.countdown * 10) / 10;
      if (this.countdown <= 0) {
        this.stopCountdown();
      }
    }, 100);
  }

  stopCountdown() {
    clearInterval(this.countdownInterval);
    this.showTimerNum = false;
  }


}

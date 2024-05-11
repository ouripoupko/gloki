import { Component, OnInit } from '@angular/core';
import { GlokiService, Invite } from '../../gloki.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {

  isLoading: boolean = false;
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
    console.log('ngOnInit list checking if profile exists');
    if (!this.gloki.isProfileFull()) {
      this.isLoading = true;
      this.gloki.readProfile().subscribe(_ => {
        this.isLoading = false;
        if (!this.gloki.isProfileFull()) {
          this.router.navigate(['main', 'profile'], {replaceUrl: true})
        }
      });
    }
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

import { Component, OnInit } from '@angular/core';
import { GlokiService } from '../gloki.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  isLoading: boolean = false;
  communities = [{name: "EDDY 2024", id: "112"}, {name: "Global Democracy Initiative", id: "32"}, {name: "Miller Family", id: "99"}];

  constructor (
    private gloki: GlokiService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('profile', this.gloki.profile);
    this.isLoading = true;
    if (!this.gloki.profile) {
      this.gloki.readProfile().subscribe(_ => {
        this.isLoading = false;
        if (!this.gloki.isProfileFull()) {
          this.router.navigate(['profile'])
        }
      });
    }
  }
 
}

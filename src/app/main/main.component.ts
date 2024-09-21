import { Component, OnInit } from '@angular/core';
import { GlokiService } from '../services/gloki.service';
import { Router, RouterModule } from '@angular/router';
import { MainBarComponent } from './main-bar/main-bar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MainBarComponent
  ],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit{

  isLoading = true;

  constructor (
    public gloki: GlokiService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.gloki.agentExists) {
      this.doLogin();
    } else {
      const server = sessionStorage.getItem('server');
      const agent = sessionStorage.getItem('agent');
      if (server && agent) {
        this.gloki.setServer(server, agent).subscribe({
          next: result => {
            if (result) {
              this.doLogin();
              this.router.navigate(['main', 'communities'], {replaceUrl: true});
            } else {
              this.restart();
            }
          },
          error: error => {
            this.restart();
          }
        });
      } else {
        this.restart();
      }
    }
  }

  restart() {
    this.router.navigate(['login'], {replaceUrl: true});
  }

  doLogin() {
    this.gloki.login().subscribe(_ => {
      this.isLoading = false;
    });
  }
}

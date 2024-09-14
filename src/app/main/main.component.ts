import { Component, OnInit } from '@angular/core';
import { GlokiService } from '../services/gloki.service';
import { Router, RouterModule } from '@angular/router';
import { MainBarComponent } from './main-bar/main-bar.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    RouterModule,
    MainBarComponent
  ],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit{

  constructor (
    public gloki: GlokiService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('main ngOnInit', this.gloki.agentExists);
    if (!this.gloki.agentExists) {
      this.router.navigate(['login'], {replaceUrl: true});
      return;
    }
  }
}
